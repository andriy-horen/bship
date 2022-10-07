import {
  Coordinates,
  MoveStatus,
  Player,
  ShipCoordinates,
} from 'bship-contracts';
import { mapLastEntry } from './utils';

export interface GameStateEvent {
  player: Player;
  coordinates: Coordinates;
}

export interface GameStateUpdateResult {
  nextPlayer: number;
  moveStatus: MoveStatus;
  isValidMove?: boolean;
}

export const INVALID_MOVE: GameStateUpdateResult = {
  nextPlayer: Player.Player0,
  moveStatus: MoveStatus.Miss,
  isValidMove: false,
};

type StringGameEvent = `p${number}:${number},${number}`;

export class GameState {
  private readonly _fleet1: readonly ShipCoordinates[] = [];
  private readonly _fleet2: readonly ShipCoordinates[] = [];

  private readonly _state = new Map<StringGameEvent, GameStateUpdateResult>();

  constructor(fleet1: ShipCoordinates[], fleet2: ShipCoordinates[]) {
    this._fleet1 = Object.freeze(fleet1);
    this._fleet2 = Object.freeze(fleet2);
  }

  update(event: GameStateEvent): GameStateUpdateResult {
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
    if (!this.isNewGame && event.player !== this.lastUpdate!.nextPlayer) {
      return INVALID_MOVE;
    }

    const update = this.getUpdateResult(event);
    this._state.set(key, update);

    return update;
  }

  get lastUpdate(): GameStateUpdateResult | undefined {
    const lastEntry = mapLastEntry(this._state);

    return lastEntry?.[1];
  }

  get isNewGame(): boolean {
    return this._state.size === 0;
  }

  getUpdateResult({
    player,
    coordinates,
  }: GameStateEvent): GameStateUpdateResult {
    const targetFleet = player === 0 ? this._fleet2 : this._fleet1;

    const target = targetFleet.find((ship) => isShipHit(ship, coordinates));
    if (!target) {
      return {
        nextPlayer: takeTurn(player),
        moveStatus: MoveStatus.Miss,
      };
    }

    const isSunk = expandShip(target)
      .filter(({ x, y }) => x !== coordinates.x && y !== coordinates.y)
      .every((coord) => this._state.get(gameStateKey(player, coord)));

    return {
      nextPlayer: player,
      moveStatus: isSunk ? MoveStatus.Sunk : MoveStatus.Hit,
    };
  }
}

function gameStateKey(player: Player, coord: Coordinates): StringGameEvent {
  return `p${player}:${coord.y},${coord.x}`;
}

function isShipHit(
  [head, tail]: ShipCoordinates,
  { x, y }: Coordinates,
): boolean {
  return x >= head.x && x <= tail.x && y >= head.y && y <= tail.y;
}

function takeTurn(current: Player): Player {
  return current === Player.Player0 ? Player.Player1 : Player.Player0;
}

function expandShip([head, tail]: ShipCoordinates): Coordinates[] {
  const result: Coordinates[] = [];
  for (let x = head.x; x <= tail.x; x++) {
    for (let y = head.y; y <= tail.y; y++) {
      result.push({ x, y });
    }
  }

  return result;
}