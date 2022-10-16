import { Coordinates } from 'bship-contracts';

export function isEqual(coord1: Coordinates, coord2: Coordinates): boolean {
  return coord1.x === coord2.x && coord1.y === coord2.y;
}

export function add(coord1: Coordinates, coord2: Coordinates): Coordinates {
  return { x: coord1.x + coord2.x, y: coord1.y + coord2.y };
}
