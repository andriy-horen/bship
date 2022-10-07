import { Coordinates, Orientation } from 'bship-contracts';

export interface BattleshipDrag {
  size: number;
  orientation: Orientation;
  coordinates: Coordinates;
}
