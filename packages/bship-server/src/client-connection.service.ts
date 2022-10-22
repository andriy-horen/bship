import { GameMessage, isGameMessage, PING, PONG } from 'bship-contracts';
import { filter, map, Observable, Subject, Subscription, tap } from 'rxjs';
import { MessageEvent } from 'ws';
import { GameWebSocket } from './game.gateway';

export interface Destroyable {
  destroy(): void;
}

export class ClientConnection implements Destroyable {
  private _lastMessageTimestamp = new Date();

  private readonly _messageEventSubject$ = new Subject<string>();

  private readonly _pingPong$ = this._messageEventSubject$.pipe(
    filter((message) => message === PING),
    tap(() => this._socket.send(PONG))
  );
  private readonly _pingPongSubscription: Subscription | undefined;

  readonly gameMessages$: Observable<GameMessage> = this._messageEventSubject$.pipe(
    filter((message) => message.trim().startsWith('{')),
    map((message) => JSON.parse(message)),
    filter((message) => isGameMessage(message))
  );

  private readonly messageEventHandler = (message: MessageEvent) => {
    this._lastMessageTimestamp = new Date();
    this._messageEventSubject$.next(message.data.toString());
  };

  constructor(private readonly _socket: GameWebSocket) {
    this._socket.addEventListener('message', this.messageEventHandler);
    this._pingPongSubscription = this._pingPong$.subscribe();
  }

  get lastMessageTimestamp(): Date {
    return this._lastMessageTimestamp;
  }

  get id(): string {
    return this._socket.connectionId!;
  }

  notify(message: GameMessage): void {
    if (this._socket.readyState === this._socket.OPEN) {
      this._socket.send(JSON.stringify(message));
    }
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
    this._socket.removeEventListener('message', this.messageEventHandler);
    this._pingPongSubscription?.unsubscribe();
    this.closeConnection();
  }
}
