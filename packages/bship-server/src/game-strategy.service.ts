import { MoveStatus, Player } from 'bship-contracts';
import { GameEvent, GameEventString, GameUpdate } from './game-state.service';
import { nextPlayer } from './utils';

export interface GameStrategy {
  getNextTurn(
    event: GameEvent,
    status: MoveStatus,
    state: Map<GameEventString, GameUpdate>
  ): Player;

  get gridSize(): number;
  get firstTurn(): Player;
}

export class SeaBattleGameStrategy implements GameStrategy {
  get gridSize(): number {
    // TODO: consider extracting to the global config
    return 10;
  }

  get firstTurn(): Player {
    return Player.P1;
  }

  getNextTurn(
    event: GameEvent,
    status: MoveStatus,
    state: Map<GameEventString, GameUpdate>
  ): Player {
    if (state.size === 0) {
      return this.firstTurn;
    }

    return status === MoveStatus.Hit ? event.player : nextPlayer(event.player);
  }
}

export class HasbroGameStrategy implements GameStrategy {
  getNextTurn(event: GameEvent): Player {
    return nextPlayer(event.player);
  }

  get gridSize(): number {
    return 10;
  }

  get firstTurn(): Player {
    return Player.P1;
  }
}
