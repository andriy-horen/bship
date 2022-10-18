import { GameMessageType, GameUpdatePayload, Player } from 'bship-contracts';
import { RawData, WebSocket } from 'ws';
import { ClientPairingRequest } from './client-pairing.service';
import { GameState } from './game-state';
import { GameStateFactory } from './game-state-factory.service';
import { nextPlayer } from './utils';

export class GameContext {
  private readonly _client1: WebSocket;
  private readonly _client2: WebSocket;

  private readonly _gameId = 'game1';

  private readonly _gameState: GameState;

  constructor(
    player1: ClientPairingRequest,
    player2: ClientPairingRequest,
    gameStateFactory: GameStateFactory
  ) {
    this._client1 = player1.socket;
    this._client2 = player2.socket;

    this._gameState = gameStateFactory.createGameState(player1.fleet, player2.fleet);
    this._gameState.state$.subscribe((update) => {
      this.notifyClients((recipient) => ({
        event: GameMessageType.GameUpdate,
        data: {
          coord: update.sourceEvent.coord,
          status: update.status,
          sunk: update.sunkShip,
          next: update.nextTurn === recipient,
          self: nextPlayer(update.sourceEvent.player) === recipient,
        } as GameUpdatePayload,
      }));

      if (update.gameResult) {
        const { winner } = update.gameResult;
        this.notifyClients((recipient) => ({
          event: GameMessageType.GameCompleted,
          data: {
            won: winner === recipient,
          },
        }));
      }
    });

    // TODO: next player is hardcoded here and instead should be provided by game state obj
    this.notifyClients((recipient) => ({
      event: GameMessageType.GameStarted,
      data: { gameId: this._gameId, next: recipient === Player.P1 },
    }));

    this.subscribe();
  }

  notifyClients(messageProvider: (player: Player) => { event: GameMessageType; data?: any }): void {
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
      if (message.event !== GameMessageType.GameEvent) {
        return;
      }
      const data = message.data;

      this._gameState.update({
        player,
        coord: data.coordinates,
      });
    };
  };

  get clients(): [WebSocket, WebSocket] {
    return [this._client1, this._client2];
  }

  abortGame(): void {
    this.notifyClients(() => ({
      event: GameMessageType.GameAborted,
    }));
  }
}
