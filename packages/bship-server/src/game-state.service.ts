import { Injectable, Scope } from '@nestjs/common';
import {
  contains,
  isEqual,
  MoveStatus,
  Player,
  Point,
  Rect,
  toPoints,
  upperBound,
} from 'bship-contracts';
import { ReplaySubject, takeWhile } from 'rxjs';
import { GameStrategy } from './game-strategy.service';
import { nextPlayer } from './utils';

export interface GameResult {
  winner: Player;
}

export interface GameEvent {
  player: Player;
  coord: Point;
}

export interface GameUpdate {
  sourceEvent: GameEvent;
  nextTurn: Player;
  status: MoveStatus;
  gameResult?: GameResult;
  sunkShip?: Rect;
}

@Injectable({ scope: Scope.TRANSIENT })
export class GameStateService {
  private readonly _fleet1: Map<Rect, boolean>;
  private readonly _fleet2: Map<Rect, boolean>;
  private readonly _state = new Map<GameEventString, GameUpdate>();

  private _gameResult: GameResult | null = null;

  private readonly _gameUpdateSubject = new ReplaySubject<GameUpdate>();

  constructor(private _gameStrategy: GameStrategy, fleet1: Rect[], fleet2: Rect[]) {
    this._fleet1 = new Map(fleet1.map((ship) => [ship, true]));
    this._fleet2 = new Map(fleet2.map((ship) => [ship, true]));
  }

  readonly state$ = this._gameUpdateSubject.pipe(takeWhile((update) => !update.gameResult));

  update(event: GameEvent): boolean {
    if (this.isGameCompleted) {
      return false;
    }

    if (!this.isValidGameEvent(event)) {
      return false;
    }

    const update = this.getUpdate(event);
    this._state.set(gameStateKey(event), update);
    this._gameUpdateSubject.next(update);

    return true;
  }

  get isGameCompleted(): boolean {
    return !!this._gameResult;
  }

  private fleetDestroyed(fleet: Map<Rect, boolean>): boolean {
    return [...fleet.values()].every((alive) => !alive);
  }

  private tryGetGameResult(): GameResult | null {
    if (this.fleetDestroyed(this._fleet1)) {
      return { winner: Player.P2 };
    }
    if (this.fleetDestroyed(this._fleet2)) {
      return { winner: Player.P1 };
    }

    return null;
  }

  private getUpdate(event: GameEvent): GameUpdate {
    const { player, coord } = event;
    const targetFleet = player === 0 ? this._fleet2 : this._fleet1;
    const targetShip = Array.from(targetFleet.keys()).find((ship) => contains(coord, ship));
    if (!targetShip) {
      return {
        sourceEvent: event,
        nextTurn: nextPlayer(player),
        status: MoveStatus.Miss,
      };
    }

    const isSunk = toPoints(targetShip)
      .filter((shipCoord) => !isEqual(coord, shipCoord))
      .every((shipCoord) => this._state.get(gameStateKey({ player, coord: shipCoord })));

    if (!isSunk) {
      return {
        sourceEvent: event,
        nextTurn: player,
        status: MoveStatus.Hit,
      };
    }

    // sunk the ship
    targetFleet.set(targetShip, false);
    // get game result; null - if game's ongoing
    this._gameResult = this.tryGetGameResult();

    return {
      sourceEvent: event,
      nextTurn: player,
      gameResult: this._gameResult ?? undefined,
      status: MoveStatus.Hit,
      sunkShip: targetShip,
    };
  }

  private isValidGameEvent(event: GameEvent): boolean {
    const isInsideBounds = upperBound(event.coord, this._gameStrategy.gridSize);
    const isDuplicate = this.checkIfDuplicate(event);
    const outOfTurn = this.checkIfOutOfTurn(event);

    return isInsideBounds && !isDuplicate && !outOfTurn;
  }

  private checkIfDuplicate(event: GameEvent): boolean {
    return this._state.has(gameStateKey(event));
  }

  private checkIfOutOfTurn(event: GameEvent): boolean {
    if (this._state.size === 0) {
      return event.player !== this._gameStrategy.firstTurn;
    }

    const lastUpdate = [...this._state.values()][this._state.size - 1];
    return event.player !== lastUpdate.nextTurn;
  }
}

export type GameEventString = `p${number}:${number},${number}`;

export function gameStateKey({ player, coord }: GameEvent): GameEventString {
  return `p${player}:${coord.y},${coord.x}`;
}
