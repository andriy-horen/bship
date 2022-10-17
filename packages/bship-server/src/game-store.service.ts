import { Injectable } from '@nestjs/common';
import { contains, MoveStatus, Player, Point, Rect } from 'bship-contracts';
import { isEqual } from 'lodash';
import { IdGeneratorService } from './id-generator.service';
import { mapLastEntry } from './utils';

export interface AddGameRequest {
  fleet1: Rect[];
  fleet2: Rect[];
}

@Injectable()
export class GameStoreService {
  private readonly _games = new Map<string, GameState>();

  constructor(private idGenerator: IdGeneratorService) {}

  addGame(game: AddGameRequest): string {
    const gameId = this.idGenerator.generate();
    this._games.set(gameId, new GameState(game.fleet1, game.fleet2));

    return gameId;
  }

  updateGame(gameId: string, event: GameStateEvent): GameStateUpdate | null {
    const gameState = this._games.get(gameId);

    if (!gameState) {
      throw new Error('game not found');
    }

    return gameState.update(event);
  }

  getGameResult(gameId: string): GameResult {
    const gameState = this._games.get(gameId);

    if (!gameState) {
      throw new Error('game not found');
    }

    return gameState.gameResult;
  }
}

export interface GameStateEvent {
  player: Player;
  coordinates: Point;
}

// TODO: there's possibly to much different concepts expressed here in the single model (refactor?)
export interface GameStateUpdate {
  event: GameStateEvent;
  nextTurn: Player;
  moveStatus: MoveStatus;
  gameCompleted: boolean;
  sunkShip?: Rect;
}

type StringGameEvent = `p${number}:${number},${number}`;

export interface GameResult {
  completed: boolean;
  winner?: Player;
}

export class GameState {
  private readonly _fleetStatus1: Map<Rect, boolean>;
  private readonly _fleetStatus2: Map<Rect, boolean>;

  private readonly _state = new Map<StringGameEvent, GameStateUpdate>();

  private _gameResult: GameResult = { completed: false };

  constructor(fleet1: Rect[], fleet2: Rect[]) {
    this._fleetStatus1 = new Map(fleet1.map((ship) => [ship, true]));
    this._fleetStatus2 = new Map(fleet2.map((ship) => [ship, true]));
  }

  update(event: GameStateEvent): GameStateUpdate | null {
    if (this._gameResult.completed) {
      return null;
    }

    const key = gameStateKey(event.player, event.coordinates);
    /**
     * When move is repeated (duplicate) return invalid state
     */
    if (this._state.has(key)) {
      return null;
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
      return null;
    }

    /**
     * When update comes from player out of turn
     */
    if (event.player !== (this.lastUpdate?.nextTurn ?? Player.P1)) {
      return null;
    }

    const update = this.getUpdateResult(event);
    this._state.set(key, update);

    return update;
  }

  get lastUpdate(): GameStateUpdate | undefined {
    const lastEntry = mapLastEntry(this._state);

    return lastEntry?.[1];
  }

  get gameResult(): GameResult {
    return this._gameResult;
  }

  private checkGameCompletion(): void {
    const fleet1Destroyed = [...this._fleetStatus1.values()].every((alive) => !alive);
    const fleet2Destroyed = [...this._fleetStatus2.values()].every((alive) => !alive);

    if (!fleet1Destroyed && !fleet2Destroyed) {
      return;
    }

    const winner = fleet1Destroyed ? Player.P2 : Player.P1;
    this._gameResult = { completed: true, winner };
  }

  getUpdateResult(event: GameStateEvent): GameStateUpdate {
    const { player, coordinates } = event;
    const targetFleet = player === 0 ? this._fleetStatus2 : this._fleetStatus1;
    const targetShip = Array.from(targetFleet.keys()).find((ship) => contains(coordinates, ship));
    if (!targetShip) {
      return {
        event,
        nextTurn: flipPlayer(player),
        moveStatus: MoveStatus.Miss,
        gameCompleted: this._gameResult.completed,
      };
    }

    const isSunk = expandShip(targetShip)
      .filter((sectionCoord) => !isEqual(sectionCoord, coordinates))
      .every((sectionCoord) => this._state.get(gameStateKey(player, sectionCoord)));

    if (isSunk) {
      targetFleet.set(targetShip, false);
      this.checkGameCompletion();
    }

    return {
      event,
      nextTurn: player,
      moveStatus: MoveStatus.Hit,
      gameCompleted: this._gameResult.completed,
      sunkShip: isSunk ? targetShip : undefined,
    };
  }
}

function gameStateKey(player: Player, coord: Point): StringGameEvent {
  return `p${player}:${coord.y},${coord.x}`;
}

export function flipPlayer(current: Player): Player {
  return current === Player.P1 ? Player.P2 : Player.P1;
}

function expandShip([head, tail]: Rect): Point[] {
  const result: Point[] = [];
  for (let x = head.x; x <= tail.x; x++) {
    for (let y = head.y; y <= tail.y; y++) {
      result.push({ x, y });
    }
  }

  return result;
}
