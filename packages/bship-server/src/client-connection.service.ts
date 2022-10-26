import { GameMessage, isGameMessage, PING, PONG } from 'bship-contracts';
import { filter, first, map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { CloseEvent, MessageEvent } from 'ws';
import { GameWebSocket } from './game.gateway';

export interface Destroyable {
  destroy(): void;
}

export class ClientConnection implements Destroyable {
  private readonly _closeEventHandler = (event: CloseEvent) => {
    this._disconnectSubject$.next(event);
  };

  private readonly _disconnectSubject$ = new Subject<CloseEvent>();

  readonly disconnect$ = this._disconnectSubject$.asObservable().pipe(first());

  private _lastMessageTimestamp = new Date();

  private readonly _messageEventHandler = (message: MessageEvent) => {
    this._lastMessageTimestamp = new Date();
    this._messageEventSubject$.next(message.data.toString());
  };

  private readonly _messageEventSubject$ = new Subject<string>();

  readonly gameMessages$: Observable<GameMessage> = this._messageEventSubject$.pipe(
    filter((message) => message.trim().startsWith('{')),
    map((message) => JSON.parse(message)),
    filter((message) => isGameMessage(message))
  );

  private readonly _pingPongSub = this._messageEventSubject$
    .pipe(
      filter((message) => message === PING),
      tap(() => this._socket.send(PONG)),
      takeUntil(this._disconnectSubject$)
    )
    .subscribe();

  constructor(private readonly _socket: GameWebSocket) {
    this._socket.addEventListener('message', this._messageEventHandler);
    this._socket.addEventListener('close', this._closeEventHandler);
  }

  get lastMessageTimestamp(): Date {
    return this._lastMessageTimestamp;
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
    this._disconnectSubject$.complete();
  }
}
