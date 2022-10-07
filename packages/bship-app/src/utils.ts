import { Battleship, BattleshipCoord } from 'bship-contracts';

export function toBattleshipCoord(ship: Battleship): BattleshipCoord {
  const x = ship.coordinates.x + (ship.orientation === 'h' ? ship.size - 1 : 0);
  const y = ship.coordinates.y + (ship.orientation === 'v' ? ship.size - 1 : 0);

  return [ship.coordinates, { x, y }];
}
