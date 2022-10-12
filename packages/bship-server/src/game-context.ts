import { GameMessageType, GameResponseType, MarkPayload, Player } from 'bship-contracts';
import { RawData, WebSocket } from 'ws';
import { ClientPairingRequest } from './client-pairing.service';
import { GameStoreService } from './game-store.service';

export class GameContext {
  private readonly _client1: WebSocket;
  private readonly _client2: WebSocket;

  private readonly _gameId: string;

  constructor(
    player1: ClientPairingRequest,
    player2: ClientPairingRequest,
    private _gameStore: GameStoreService
  ) {
    this._client1 = player1.socket;
    this._client2 = player2.socket;

    this._gameId = this._gameStore.addGame({
      fleet1: player1.fleet,
      fleet2: player2.fleet,
    });

    // TODO: next player is hardcoded here and instead should be provided by game state obj
    this.notifyClient(this._client1, {
      event: GameResponseType.GameStarted,
      data: { gameId: this._gameId, next: true },
    });

    this.notifyClient(this._client2, {
      event: GameResponseType.GameStarted,
      data: { gameId: this._gameId, next: false },
    });

    this.subscribe();
  }

  notifyClient(client: WebSocket, message: { event: GameResponseType; data?: any }): void {
    client.send(JSON.stringify(message));
  }

  subscribe(): void {
    this._client1.on('message', this.messageHandlerFactory(Player.P1));
    this._client2.on('message', this.messageHandlerFactory(Player.P2));
  }

  private messageHandlerFactory = (player: Player) => {
    return (messageRaw: RawData) => {
      const message = JSON.parse(messageRaw.toString());
      if (message.event !== GameMessageType.Move) {
        return;
      }

      const data = message.data;

      const updateResult = this._gameStore.updateGame(this._gameId, {
        player,
        coordinates: data.coordinates,
      });

      if (!updateResult) {
        return;
      }

      console.log(updateResult);

      this.notifyClient(this._client1, {
        event: GameResponseType.Mark,
        data: {
          coordinates: data.coordinates,
          value: updateResult.moveStatus,
          target: updateResult.sunkShip,
          next: updateResult.nextTurn === Player.P1,
          self: player === Player.P2,
        } as MarkPayload,
      });

      this.notifyClient(this._client2, {
        event: GameResponseType.Mark,
        data: {
          coordinates: data.coordinates,
          value: updateResult.moveStatus,
          target: updateResult.sunkShip,
          next: updateResult.nextTurn === Player.P2,
          self: player === Player.P1,
        } as MarkPayload,
      });

      if (updateResult.gameCompleted) {
        this.notifyClient(this._client1, {
          event: GameResponseType.GameCompleted,
          data: {
            won: this._gameStore.getGameResult(this._gameId).winner === Player.P1,
          },
        });

        this.notifyClient(this._client2, {
          event: GameResponseType.GameCompleted,
          data: {
            won: this._gameStore.getGameResult(this._gameId).winner === Player.P2,
          },
        });
      }
    };
  };
}
