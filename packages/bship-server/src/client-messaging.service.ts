import { Injectable } from '@nestjs/common';
import { GameMessage, GameMessageType, isGameMessage, Player } from 'bship-contracts';
import { filter, fromEvent, map, merge, Observable } from 'rxjs';
import { MessageEvent, WebSocket } from 'ws';

@Injectable()
export class ClientMessagingService {
  private readonly _messages1$: Observable<[GameMessage, Player]>;
  private readonly _messages2$: Observable<[GameMessage, Player]>;

  readonly gameEvents$: Observable<[GameMessage, Player]>;

  constructor(private readonly _client1: WebSocket, private readonly _client2: WebSocket) {
    const fromMessageEvent = (client: WebSocket) => {
      return fromEvent(client, 'message').pipe(
        map((message) => JSON.parse((message as MessageEvent).data.toString())),
        filter((message) => isGameMessage(message))
      );
    };

    this._messages1$ = fromMessageEvent(_client1).pipe(map((message) => [message, Player.P1]));
    this._messages2$ = fromMessageEvent(_client2).pipe(map((message) => [message, Player.P2]));

    this.gameEvents$ = merge(this._messages1$, this._messages2$).pipe(
      filter(([message]) => message.event === GameMessageType.GameEvent)
    );
  }

  private notifyClient(client: WebSocket, message: any): void {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  notifyBoth(message: GameMessage): void {
    this.notifyClient(this._client1, message);
    this.notifyClient(this._client2, message);
  }

  notifyBothFactory(factory: (player: Player) => GameMessage): void {
    this.notifyClient(this._client1, factory(Player.P1));
    this.notifyClient(this._client2, factory(Player.P2));
  }
}
