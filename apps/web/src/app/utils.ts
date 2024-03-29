import {
  Battleship,
  GRID_LOWER_BOUND,
  GRID_UPPER_BOUND,
  Orientation,
  Point,
  Rect,
} from '@bship/contracts';
import { range } from 'lodash-es';

export function toRect(ship: Battleship): Rect {
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
export function toBattleshipModel(battleshipCoord: Rect, hit?: number[] | boolean): Battleship {
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

export function isValidCoordinate({ x, y }: Point): boolean {
  return (
    x >= GRID_LOWER_BOUND && x <= GRID_UPPER_BOUND && y >= GRID_LOWER_BOUND && y <= GRID_UPPER_BOUND
  );
}

export function getCornerCoordinates({ x, y }: Point): Point[] {
  return [
    { x: x - 1, y: y - 1 },
    { x: x + 1, y: y - 1 },
    { x: x + 1, y: y + 1 },
    { x: x - 1, y: y + 1 },
  ].filter((coord) => isValidCoordinate(coord));
}

export function getBoxCoordinates([head, tail]: Rect): Point[] {
  const coords: Point[] = [];

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
