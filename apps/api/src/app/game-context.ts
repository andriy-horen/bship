import { GameMessage, GameMessageType, GameUpdatePayload, Player } from '@bship/contracts';
import { combineLatest, delayWhen, filter } from 'rxjs';
import { ClientConnection, Destroyable } from './client-connection.service';
import { ClientPairingRequest } from './client-pairing.service';
import { GameResult, GameState, GameUpdate } from './game-state';
import { GameStateFactory } from './game-state-factory.service';
import { nextPlayer } from './utils';

export class GameContext implements Destroyable {
  private readonly _gameId = 'game1';
  private readonly _gameState: GameState;

  readonly connection1: ClientConnection;
  readonly connection2: ClientConnection;

  private sequenceId = 0;

  constructor(
    player1: ClientPairingRequest,
    player2: ClientPairingRequest,
    gameStateFactory: GameStateFactory
  ) {
    this.connection1 = new ClientConnection(player1.socket);
    this.connection2 = new ClientConnection(player2.socket);

    this.connection1.errorState.subscribe(() => {
      this.connection1.closeConnection();
      this.connection1.destroy();
      this.connection2.closeConnection();
      this.connection2.destroy();
    });
    this.connection2.errorState.subscribe(() => {
      this.connection1.closeConnection();
      this.connection1.destroy();
      this.connection2.closeConnection();
      this.connection2.destroy();
    });

    this.connection1.connectionClosed.subscribe(() => {
      this.connection2.closeConnection();
      this.connection2.destroy();
      this.connection1.destroy();
    });

    this.connection2.connectionClosed.subscribe(() => {
      this.connection1.closeConnection();
      this.connection1.destroy();
      this.connection2.destroy();
    });

    this.connection1.gameMessage
      .pipe(filter((message) => message.event === GameMessageType.GameEvent))
      .subscribe(({ data }) => {
        this._gameState.update({
          player: Player.P1,
          coord: data.coordinates,
        });
      });

    this.connection2.gameMessage
      .pipe(filter((message) => message.event === GameMessageType.GameEvent))
      .subscribe(({ data }) => {
        this._gameState.update({
          player: Player.P2,
          coord: data.coordinates,
        });
      });

    const bothReady = combineLatest([
      this.connection1.readyState,
      this.connection2.readyState,
    ]).pipe(filter(([ready1, ready2]) => ready1 && ready2));

    this._gameState = gameStateFactory.createGameState(player1.fleet, player2.fleet);
    this._gameState.stateUpdate.pipe(delayWhen(() => bothReady)).subscribe((update) => {
      this.connection1.notify(gameUpdateFactory(Player.P1, update, this.sequenceId));
      this.connection2.notify(gameUpdateFactory(Player.P2, update, this.sequenceId));
      this.sequenceId++;
    });

    // TODO: next player is hardcoded here and instead should be provided by game state obj
    this.connection1.notify(gameStartedFactory(Player.P1, this.sequenceId));
    this.connection2.notify(gameStartedFactory(Player.P2, this.sequenceId));
    this.sequenceId++;
  }

  destroy(): void {
    this.connection1.destroy();
    this.connection2.destroy();
  }
}

function gameUpdateFactory(player: Player, update: GameUpdate, seq: number): GameMessage {
  return {
    event: GameMessageType.GameUpdate,
    data: {
      coord: update.sourceEvent.coord,
      status: update.status,
      sunk: update.sunkShip,
      next: update.nextTurn === player,
      self: nextPlayer(update.sourceEvent.player) === player,
      won: gameWonByPlayer(player, update.gameResult),
    } as GameUpdatePayload,
    seq,
  };
}

function gameStartedFactory(player: Player, seq: number): GameMessage {
  return {
    event: GameMessageType.GameStarted,
    data: { gameId: 'game1', next: player === Player.P1 },
    seq,
  };
}

function gameWonByPlayer(player: Player, gameResult: GameResult | undefined): boolean | undefined {
  if (!gameResult) {
    return;
  }

  return gameResult.winner === player;
}
