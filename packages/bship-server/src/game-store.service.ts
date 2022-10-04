import { Injectable } from '@nestjs/common';
import { AttackStatus, Coordinates, Player } from 'bship-contracts';
import { mapLastEntry } from './utils';

@Injectable()
export class GameStoreService {
  private readonly _games = new Map<string, GameState>();

  addGame(gameId: string): void {}
}

export interface GameStateEvent {
  player: Player;
  coordinates: Coordinates;
}

export interface GameStateUpdateResult {
  nextPlayer: number;
  moveStatus: AttackStatus;
  isValidMove?: boolean;
}

export const INVALID_MOVE: GameStateUpdateResult = {
  nextPlayer: Player.Player0,
  moveStatus: AttackStatus.Miss,
  isValidMove: false,
};

type StringGameEvent = `p${number}:${number},${number}`;

export class GameState {
  private readonly _fleet1: number[][] = [];
  private readonly _fleet2: number[][] = [];

  private readonly _state = new Map<StringGameEvent, GameStateUpdateResult>();

  constructor(fleet1: number[][], fleet2: number[][]) {
    this._fleet1 = fleet1;
    this._fleet2 = fleet2;
  }

  update(event: GameStateEvent): GameStateUpdateResult {
    /**
     * When move is repeated (duplicate) return invalid state
     */
    if (this._state.has(gameEventToString(event))) {
      return INVALID_MOVE;
    }

    /**
     * When move is outside the grid
     */
    if (
      event.coordinates.x < 0 ||
      event.coordinates.y < 0 ||
      event.coordinates.x > 9 ||
      event.coordinates.y > 9
    ) {
      return INVALID_MOVE;
    }
  }

  get lastUpdate(): GameStateUpdateResult {
    const [, last] = mapLastEntry(this._state);

    return last;
  }

  get isNewGame(): boolean {
    return this._state.size === 0;
  }

  getUpdateResult({
    player,
    coordinates,
  }: GameStateEvent): GameStateUpdateResult {
    const targetFleet = player === 0 ? this._fleet2 : this._fleet1;
    if (targetFleet[coordinates.y][coordinates.x] > 0) {
    }

    return {
      nextPlayer: 0,
      moveStatus: AttackStatus.Hit,
    };
  }
}

function gameEventToString(event: GameStateEvent): StringGameEvent {
  return `p${event.player}:${event.coordinates.y},${event.coordinates.y}`;
}

function isEqual(event1: GameStateEvent, event2: GameStateEvent): boolean {
  const {
    player: player1,
    coordinates: { x: x1, y: y1 },
  } = event1;

  const {
    player: player2,
    coordinates: { x: x2, y: y2 },
  } = event2;

  return player1 === player2 && x1 === x2 && y1 === y2;
}
