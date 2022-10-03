import { Injectable } from '@nestjs/common';

export enum MoveStatus {
  Hit,
  Miss,
  Sunk,
  Invalid,
}

@Injectable()
export class GameStoreService {
  private readonly _games = new Map<string, GameState>();

  addGame(gameId: string): void {}
}

export interface GameStateEvent {
  player: number;
  position: { y: number; x: number };
}

export interface GameStateUpdateResult {
  nextPlayer: number;
  moveStatus: MoveStatus;
}

function isEqual(event1: GameStateEvent, event2: GameStateEvent): boolean {
  const {
    player: player1,
    position: { x: x1, y: y1 },
  } = event1;

  const {
    player: player2,
    position: { x: x2, y: y2 },
  } = event2;

  return player1 === player2 && x1 === x2 && y1 === y2;
}

export class GameState {
  private readonly _state: GameStateEvent[] = [];

  private readonly _fleet1: number[][] = [];
  private readonly _fleet2: number[][] = [];

  constructor(fleet1: number[][], fleet2: number[][]) {
    this._fleet1 = fleet1;
    this._fleet2 = fleet2;
  }

  update(event: GameStateEvent): GameStateUpdateResult {
    /**
     * When move is repeated (duplicate) return invalid state
     */
    const duplicate = this._state.some((e) => isEqual(e, event));
    if (duplicate) {
      return {
        nextPlayer: 0,
        moveStatus: MoveStatus.Invalid,
      };
    }

    /**
     * When move is outside the grid
     */
    if (
      event.position.x < 0 ||
      event.position.y < 0 ||
      event.position.x > 9 ||
      event.position.y > 9
    ) {
      return {
        nextPlayer: 0,
        moveStatus: MoveStatus.Invalid,
      };
    }
  }

  get lastEvent(): GameStateEvent {
    return this._state[this._state.length - 1];
  }

  get isNewGame(): boolean {
    return this._state.length === 0;
  }

  getUpdateResult({ player, position }: GameStateEvent): GameStateUpdateResult {
    const targetFleet = player === 0 ? this._fleet2 : this._fleet1;
    if (targetFleet[position.y][position.x] > 0) {
    }

    return {
      nextPlayer: 0,
      moveStatus: MoveStatus.Hit,
    };
  }
}
