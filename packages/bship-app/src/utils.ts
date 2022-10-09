import { Battleship, BattleshipCoord, Coordinates, Orientation } from 'bship-contracts';

export function toBattleshipCoord(ship: Battleship): BattleshipCoord {
  const x = ship.coordinates.x + (ship.orientation === 'h' ? ship.size - 1 : 0);
  const y = ship.coordinates.y + (ship.orientation === 'v' ? ship.size - 1 : 0);

  return [ship.coordinates, { x, y }];
}

export function toBattleshipModel(battleshipCoord: BattleshipCoord): Battleship {
  const [head, tail] = battleshipCoord;
  const orientation: Orientation = head.y === tail.y ? 'h' : 'v';
  const size = orientation === 'h' ? tail.x - head.x + 1 : tail.y - head.y + 1;

  return {
    coordinates: battleshipCoord[0],
    orientation,
    size,
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
