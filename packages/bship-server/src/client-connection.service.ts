import { GameMessage, GameMessageType, isGameMessage, PING, PONG } from 'bship-contracts';
import {
  BehaviorSubject,
  catchError,
  filter,
  first,
  ignoreElements,
  map,
  Observable,
  of,
  Subject,
  takeUntil,
  timeout,
  withLatestFrom,
} from 'rxjs';
import { CloseEvent, MessageEvent } from 'ws';
import { GameWebSocket } from './game.gateway';

export interface Destroyable {
  destroy(): void;
}

export class ClientConnection implements Destroyable {
  // TODO: should come from global config
  private readonly CONNECTION_TIMEOUT = 60_000;

  private readonly _waitingAcknowledgeSubject = new BehaviorSubject<GameMessage | null>(null);
  private readonly _closeConnectionSubject = new Subject<CloseEvent>();
  private readonly _messageSubject = new Subject<string>();

  private readonly _closeEventHandler = (event: CloseEvent) => {
    this._closeConnectionSubject.next(event);
  };

  private readonly _messageEventHandler = (message: MessageEvent) => {
    this._messageSubject.next(message.data.toString());
  };

  private readonly _anyOrOnlyAcknowledge = (message: GameMessage) =>
    this._waitingAcknowledgeSubject.value === null || message.event === GameMessageType.Acknowledge;

  /**
   * Observable of all game messages (GameMessage type)
   */
  readonly gameMessage: Observable<GameMessage> = this._messageSubject.pipe(
    map((message) => JSON.parse(message)),
    filter((message) => isGameMessage(message)),
    // check if server waits for acknowledge
    filter(this._anyOrOnlyAcknowledge),
    takeUntil(this._closeConnectionSubject)
  );

  /**
   * Observable of timeout or any other error
   */
  readonly errorState = this._messageSubject.pipe(
    timeout(this.CONNECTION_TIMEOUT),
    ignoreElements(),
    catchError((error: Error) => of(error))
  );

  private readonly _pingPongSub = this._messageSubject
    .pipe(
      filter((message) => message === PING),
      takeUntil(this._closeConnectionSubject)
    )
    .subscribe(() => this._socket.send(PONG));

  private readonly _acknowledgeSub = this.gameMessage
    .pipe(
      filter((message) => message.event === GameMessageType.Acknowledge),
      withLatestFrom(this._waitingAcknowledgeSubject),
      filter(([acknowledge, waitingAck]) => {
        return waitingAck !== null && waitingAck.seq === acknowledge.seq;
      }),
      takeUntil(this._closeConnectionSubject)
    )
    .subscribe(() => this._waitingAcknowledgeSubject.next(null));

  /**
   * Indicates if client has acknowledged all messages send from the server and ready to recieve new messages
   */
  readonly readyState = this._waitingAcknowledgeSubject.pipe(
    map((waiting) => waiting === null),
    takeUntil(this._closeConnectionSubject)
  );

  /**
   * Indicates whether websocket connection is closed
   */
  readonly connectionClosed = this._closeConnectionSubject.pipe(first());

  constructor(private readonly _socket: GameWebSocket) {
    this._socket.addEventListener('message', this._messageEventHandler);
    this._socket.addEventListener('close', this._closeEventHandler);
  }

  get id(): string {
    return this._socket.connectionId!;
  }

  notify(message: GameMessage, acknowledge = true): boolean {
    if (this._socket.readyState !== this._socket.OPEN) {
      // TODO: implement the line below
      // this.logger.error('Sending message to a client when connection is closed', ClientConnection);
      return false;
    }

    if (this._waitingAcknowledgeSubject.value !== null) {
      return false;
    }

    if (acknowledge) {
      if (message.seq == null) {
        throw new Error('Sequence parameter is required when message acknowledgement is requested');
      }
      this._waitingAcknowledgeSubject.next(message);
    }
    this._socket.send(JSON.stringify(message));
    return true;
  }

  closeConnection(): void {
    this._socket.close();

    process.nextTick(() => {
      const openStates: number[] = [this._socket.OPEN, this._socket.CLOSING];
      if (openStates.includes(this._socket.readyState)) {
        // Socket still hangs, hard close
        this._socket.terminate();
      }
    });
  }

  destroy(): void {
    this._socket.removeEventListener('message', this._messageEventHandler);
    this._socket.removeEventListener('close', this._closeEventHandler);
    this._pingPongSub?.unsubscribe();
    this._acknowledgeSub?.unsubscribe();
    this._messageSubject.complete();
    this._closeConnectionSubject.complete();
    this._waitingAcknowledgeSubject.complete();
  }
}
