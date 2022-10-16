import { GameMessageType, GameResponseType, MarkPayload, Player } from 'bship-contracts';
import { RawData, WebSocket } from 'ws';
import { ClientPairingRequest } from './client-pairing.service';
import { flipPlayer, GameStoreService } from './game-store.service';

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
    this.notifyClients((recipient) => ({
      event: GameResponseType.GameStarted,
      data: { gameId: this._gameId, next: recipient === Player.P1 },
    }));

    this.subscribe();
  }

  notifyClients(
    messageProvider: (player: Player) => { event: GameResponseType; data?: any }
  ): void {
    this._client1.send(JSON.stringify(messageProvider(Player.P1)));
    this._client2.send(JSON.stringify(messageProvider(Player.P2)));
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

      this.notifyClients((recipient) => ({
        event: GameResponseType.Mark,
        data: {
          coordinates: data.coordinates,
          value: updateResult.moveStatus,
          target: updateResult.sunkShip,
          next: updateResult.nextTurn === recipient,
          self: flipPlayer(updateResult.event.player) === recipient,
        } as MarkPayload,
      }));

      if (updateResult.gameCompleted) {
        this.notifyClients((recipient) => ({
          event: GameResponseType.GameCompleted,
          data: {
            won: this._gameStore.getGameResult(this._gameId).winner === recipient,
          },
        }));
      }
    };
  };

  get clients(): [WebSocket, WebSocket] {
    return [this._client1, this._client2];
  }

  abortGame(): void {
    this.notifyClients(() => ({
      event: GameResponseType.GameAborted,
    }));
  }
}
