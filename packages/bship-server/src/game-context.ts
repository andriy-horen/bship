import { GameMessageType, GameResponseType, Player } from 'bship-contracts';
import { RawData, WebSocket } from 'ws';
import { ClientPairingRequest } from './client-pairing.service';
import { GameStoreService } from './game-store.service';

export class GameContext {
  private readonly _player1: WebSocket;
  private readonly _player2: WebSocket;

  private readonly _gameId: string;

  constructor(
    player1: ClientPairingRequest,
    player2: ClientPairingRequest,
    private _gameStore: GameStoreService
  ) {
    this._player1 = player1.socket;
    this._player2 = player2.socket;

    this._gameId = this._gameStore.addGame({
      fleet1: player1.fleet,
      fleet2: player2.fleet,
    });

    this.notifyClients(GameResponseType.GameStarted, { gameId: this._gameId });
    this.subscribe();
  }

  notifyClients(event: GameResponseType, data?: any): void {
    this._player1.send(JSON.stringify({ event, data }));
    this._player2.send(JSON.stringify({ event, data }));
  }

  subscribe(): void {
    this._player1.on('message', this.messageHandlerFactory(Player.Player0));
    this._player2.on('message', this.messageHandlerFactory(Player.Player1));
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

      console.log(updateResult);

      if (updateResult.invalidMove) {
        return;
      }

      this._player1.send(
        JSON.stringify({
          event: GameResponseType.Mark,
          data: {
            coordinates: data.coordinates,
            value: updateResult.moveStatus,
            next: updateResult.nextPlayer === Player.Player0,
            self: player === Player.Player1,
          },
        })
      );

      this._player2.send(
        JSON.stringify({
          event: GameResponseType.Mark,
          data: {
            coordinates: data.coordinates,
            value: updateResult.moveStatus,
            next: updateResult.nextPlayer === Player.Player1,
            self: player === Player.Player0,
          },
        })
      );
    };
  };
}
