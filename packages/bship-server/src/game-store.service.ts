import { Injectable } from '@nestjs/common';
import { BattleshipCoord, Coordinates, MoveStatus, Player } from 'bship-contracts';
import { isEqual } from 'lodash';
import { IdGeneratorService } from './id-generator.service';
import { mapLastEntry } from './utils';

export interface AddGameRequest {
  fleet1: BattleshipCoord[];
  fleet2: BattleshipCoord[];
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

  updateGame(gameId: string, event: GameStateEvent): GameStateUpdate {
    const gameState = this._games.get(gameId);

    if (!gameState) {
      throw new Error('game not found');
    }

    return gameState.update(event);
  }
}

export interface GameStateEvent {
  player: Player;
  coordinates: Coordinates;
}

// TODO: there's possibly to much different concepts expressed here in the single model (refactor?)
export interface GameStateUpdate {
  nextPlayer: number;
  moveStatus: MoveStatus;
  /**
   * target is only present when after a move battleship was sunk, otherwise undefined
   */
  target?: BattleshipCoord;
  invalidMove?: boolean;
}

export const INVALID_MOVE: GameStateUpdate = {
  nextPlayer: Player.Player0,
  moveStatus: MoveStatus.Miss,
  invalidMove: true,
};

type StringGameEvent = `p${number}:${number},${number}` | 'init';

export class GameState {
  private readonly _fleet1: readonly BattleshipCoord[] = [];
  private readonly _fleet2: readonly BattleshipCoord[] = [];

  private readonly _state = new Map<StringGameEvent, GameStateUpdate>([
    [
      'init',
      {
        nextPlayer: Player.Player0,
        moveStatus: MoveStatus.Miss,
      },
    ],
  ]);

  constructor(fleet1: BattleshipCoord[], fleet2: BattleshipCoord[]) {
    this._fleet1 = Object.freeze(fleet1);
    this._fleet2 = Object.freeze(fleet2);
  }

  update(event: GameStateEvent): GameStateUpdate {
    const key = gameStateKey(event.player, event.coordinates);
    /**
     * When move is repeated (duplicate) return invalid state
     */
    if (this._state.has(key)) {
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

    /**
     * When update comes from player out of turn
     */
    if (event.player !== this.lastUpdate!.nextPlayer) {
      return INVALID_MOVE;
    }

    const update = this.getUpdateResult(event);
    this._state.set(key, update);

    return update;
  }

  get lastUpdate(): GameStateUpdate | undefined {
    const lastEntry = mapLastEntry(this._state);

    return lastEntry?.[1];
  }

  get isNewGame(): boolean {
    return this._state.size === 1;
  }

  getUpdateResult({ player, coordinates }: GameStateEvent): GameStateUpdate {
    const targetFleet = player === 0 ? this._fleet2 : this._fleet1;
    const target = targetFleet.find((ship) => isShipHit(ship, coordinates));
    if (!target) {
      return {
        nextPlayer: takeTurn(player),
        moveStatus: MoveStatus.Miss,
      };
    }

    const isSunk = expandShip(target)
      .filter((sectionCoord) => !isEqual(sectionCoord, coordinates))
      .every((sectionCoord) => this._state.get(gameStateKey(player, sectionCoord)));

    return {
      nextPlayer: player,
      moveStatus: isSunk ? MoveStatus.Sunk : MoveStatus.Hit,
      target: isSunk ? target : undefined,
    };
  }
}

function gameStateKey(player: Player, coord: Coordinates): StringGameEvent {
  return `p${player}:${coord.y},${coord.x}`;
}

function isShipHit([head, tail]: BattleshipCoord, { x, y }: Coordinates): boolean {
  return x >= head.x && x <= tail.x && y >= head.y && y <= tail.y;
}

function takeTurn(current: Player): Player {
  return current === Player.Player0 ? Player.Player1 : Player.Player0;
}

function expandShip([head, tail]: BattleshipCoord): Coordinates[] {
  const result: Coordinates[] = [];
  for (let x = head.x; x <= tail.x; x++) {
    for (let y = head.y; y <= tail.y; y++) {
      result.push({ x, y });
    }
  }

  return result;
}
