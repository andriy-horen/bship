import { Player, upperBound } from 'bship-contracts';
import { GameEvent, GameUpdate } from './game-state.service';

export interface GameStrategy {
  get goesFirst(): Player;
  get gridSize(): number;

  isValidNextMove(event: GameEvent, state: Map<string, GameUpdate>): boolean;
}

export class DefaultGameStrategy implements GameStrategy {
  get goesFirst(): Player {
    return Player.P1;
  }

  get gridSize(): number {
    return 10;
  }

  isValidNextMove(event: GameEvent, state: Map<string, GameUpdate>): boolean {
    if (state.size === 0) {
      return event.player === this.goesFirst;
    }

    const insideBounds = upperBound(event.coord, this.gridSize);

    return insideBounds;
  }
}
