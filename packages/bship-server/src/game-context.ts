import { GameMessageType, GameUpdatePayload, Player } from 'bship-contracts';
import { ClientMessagingService } from './client-messaging.service';
import { ClientPairingRequest } from './client-pairing.service';
import { GameState } from './game-state';
import { GameStateFactory } from './game-state-factory.service';
import { nextPlayer } from './utils';

export class GameContext {
  private readonly _gameId = 'game1';
  private readonly _gameState: GameState;
  private readonly _messagingService: ClientMessagingService;

  constructor(
    player1: ClientPairingRequest,
    player2: ClientPairingRequest,
    gameStateFactory: GameStateFactory
  ) {
    this._messagingService = new ClientMessagingService(player1.socket, player2.socket);
    this._messagingService.gameEvents$.subscribe(([message, player]) => {
      this._gameState.update({
        player,
        coord: message.data.coordinates,
      });
    });

    this._gameState = gameStateFactory.createGameState(player1.fleet, player2.fleet);
    this._gameState.state$.subscribe((update) => {
      this._messagingService.notifyBothFactory((recipient) => ({
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
        this._messagingService.notifyBothFactory((recipient) => ({
          event: GameMessageType.GameCompleted,
          data: {
            won: winner === recipient,
          },
        }));
      }
    });

    // TODO: next player is hardcoded here and instead should be provided by game state obj
    this._messagingService.notifyBothFactory((recipient) => ({
      event: GameMessageType.GameStarted,
      data: { gameId: this._gameId, next: recipient === Player.P1 },
    }));
  }
}
