import { GameMessage, isGameMessage, PING, PONG } from 'bship-contracts';
import {
  catchError,
  filter,
  first,
  ignoreElements,
  map,
  merge,
  Observable,
  of,
  Subject,
  takeUntil,
  tap,
  timeout,
} from 'rxjs';
import { CloseEvent, MessageEvent } from 'ws';
import { GameWebSocket } from './game.gateway';

export interface Destroyable {
  destroy(): void;
}

export class ClientConnection implements Destroyable {
  private readonly CONNECTION_TIMEOUT = 60_000;

  private readonly _closeEventHandler = (event: CloseEvent) => {
    this._closeConnectionSubject$.next(event);
  };

  private readonly _closeConnectionSubject$ = new Subject<CloseEvent>();

  readonly connectionClosed$ = merge(this._closeConnectionSubject$).pipe(first());

  private readonly _messageEventHandler = (message: MessageEvent) => {
    this._messageEventSubject$.next(message.data.toString());
  };
  private readonly _messageEventSubject$ = new Subject<string>();

  readonly gameMessages$: Observable<GameMessage> = this._messageEventSubject$.pipe(
    filter((message) => message.trim().startsWith('{')),
    map((message) => JSON.parse(message)),
    filter((message) => isGameMessage(message)),
    takeUntil(this._closeConnectionSubject$)
  );

  readonly errorState$ = this.gameMessages$.pipe(
    ignoreElements(),
    timeout(this.CONNECTION_TIMEOUT),
    catchError((error: Error) => of(error))
  );

  private readonly _pingPongSub = this._messageEventSubject$
    .pipe(
      filter((message) => message === PING),
      tap(() => this._socket.send(PONG)),
      takeUntil(this._closeConnectionSubject$)
    )
    .subscribe();

  constructor(private readonly _socket: GameWebSocket) {
    this._socket.addEventListener('message', this._messageEventHandler);
    this._socket.addEventListener('close', this._closeEventHandler);
  }

  get id(): string {
    return this._socket.connectionId!;
  }

  notify(message: GameMessage): boolean {
    if (this._socket.readyState !== this._socket.OPEN) {
      // TODO: implement the line below
      // this.logger.error('Sending message to a client when connection is closed', ClientConnection);
      return false;
    }

    if (typeof message.seq !== 'number') {
      // TODO: implement the line below
      // this.logger.error('Sending message with missing sequence (seq) parameter', ClientConnection);
      return false;
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
    this._messageEventSubject$.complete();
    this._closeConnectionSubject$.complete();
  }
}
