import { Battleship, BattleshipCoord, Coordinates } from 'bship-contracts';

export function toBattleshipCoord(ship: Battleship): BattleshipCoord {
  const x = ship.coordinates.x + (ship.orientation === 'h' ? ship.size - 1 : 0);
  const y = ship.coordinates.y + (ship.orientation === 'v' ? ship.size - 1 : 0);

  return [ship.coordinates, { x, y }];
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
