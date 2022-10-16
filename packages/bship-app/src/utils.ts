import {
  Battleship,
  BattleshipCoord,
  Coordinates,
  GRID_LOWER_BOUND,
  GRID_UPPER_BOUND,
  Orientation,
} from 'bship-contracts';
import { range } from 'lodash-es';

export function toBattleshipCoord(ship: Battleship): BattleshipCoord {
  const x = ship.coordinates.x + (ship.orientation === 'h' ? ship.size - 1 : 0);
  const y = ship.coordinates.y + (ship.orientation === 'v' ? ship.size - 1 : 0);

  return [ship.coordinates, { x, y }];
}

/**
 * Converts coordinates-based model to point-size-orientation model
 * @param battleshipCoord coordinates-based ship model
 * @param hit either array of hit sections or boolean indicating ship sunk
 * @returns Battleship Model
 */
export function toBattleshipModel(
  battleshipCoord: BattleshipCoord,
  hit?: number[] | boolean
): Battleship {
  const [head, tail] = battleshipCoord;
  const orientation: Orientation = head.y === tail.y ? 'h' : 'v';
  const size = orientation === 'h' ? tail.x - head.x + 1 : tail.y - head.y + 1;
  const hitSections = typeof hit === 'boolean' ? range(size) : hit;

  return {
    coordinates: battleshipCoord[0],
    orientation,
    size,
    hitSections,
  };
}

// TODO: this function is duplicated, extract to common
export function expandShip([head, tail]: BattleshipCoord): Coordinates[] {
  const result: Coordinates[] = [];
  for (let x = head.x; x <= tail.x; x++) {
    for (let y = head.y; y <= tail.y; y++) {
      result.push({ x, y });
    }
  }

  return result;
}

export function isValidCoordinate({ x, y }: Coordinates): boolean {
  return (
    x >= GRID_LOWER_BOUND && x <= GRID_UPPER_BOUND && y >= GRID_LOWER_BOUND && y <= GRID_UPPER_BOUND
  );
}

export function isShipHit([head, tail]: BattleshipCoord, { x, y }: Coordinates): boolean {
  return x >= head.x && x <= tail.x && y >= head.y && y <= tail.y;
}

export function getCornerCoordinates({ x, y }: Coordinates): Coordinates[] {
  return [
    { x: x - 1, y: y - 1 },
    { x: x + 1, y: y - 1 },
    { x: x + 1, y: y + 1 },
    { x: x - 1, y: y + 1 },
  ].filter((coord) => isValidCoordinate(coord));
}

export function getBoxCoordinates([head, tail]: BattleshipCoord): Coordinates[] {
  const coords: Coordinates[] = [];

  /**
   * Generates top & bottom "border" incl. corners
   */
  for (let x = head.x - 1; x <= tail.x + 1; x++) {
    const top = { x, y: head.y - 1 };
    const bottom = { x, y: tail.y + 1 };
    if (isValidCoordinate(top)) {
      coords.push(top);
    }
    if (isValidCoordinate(bottom)) {
      coords.push(bottom);
    }
  }

  /**
   * Generates left & right "border" excl. corners (the first loop already added them)
   */
  for (let y = head.y; y <= tail.y; y++) {
    const left = { x: head.x - 1, y };
    const right = { x: tail.x + 1, y };
    if (isValidCoordinate(left)) {
      coords.push(left);
    }
    if (isValidCoordinate(right)) {
      coords.push(right);
    }
  }

  return coords;
}
