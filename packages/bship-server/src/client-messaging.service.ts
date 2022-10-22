import { GameMessage, GameMessageType, Player } from 'bship-contracts';
import { filter, map, merge, Observable } from 'rxjs';
import { ClientConnection } from './client-connection.service';

export class ClientMessagingService {
  private _sequenceId = 0;

  readonly gameEvents$: Observable<[GameMessage, Player]>;

  constructor(
    private readonly _client1: ClientConnection,
    private readonly _client2: ClientConnection
  ) {
    this.gameEvents$ = merge(
      this._client1.gameMessages$.pipe(
        map((message) => [message, Player.P1] as [GameMessage, Player])
      ),
      this._client2.gameMessages$.pipe(
        map((message) => [message, Player.P2] as [GameMessage, Player])
      )
    ).pipe(filter(([message]) => message.event === GameMessageType.GameEvent));
  }

  notify(message: GameMessage): void {
    message.seq = this._sequenceId++;
    this._client1.notify(message);
    this._client2.notify(message);
  }

  notifyFactory(factory: (player: Player) => GameMessage): void {
    const message1 = factory(Player.P1);
    const message2 = factory(Player.P2);

    message1.seq = message2.seq = this._sequenceId++;

    this._client1.notify(message1);
    this._client2.notify(message2);
  }
}
