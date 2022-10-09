import { Battleship, Coordinates } from 'bship-contracts';
import { FleetLayer } from '../fleet-layer/FleetLayer';
import { GridLayer, GridSquare } from '../grid-layer/GridLayer';

export interface GridProps {
  fleet: Battleship[];
  grid: GridSquare[][];
  onSquareClick: (coordinates: Coordinates) => void;
}

export function Grid({ fleet, grid, onSquareClick }: GridProps) {
  return (
    <div>
      <FleetLayer fleet={fleet}></FleetLayer>
      <GridLayer grid={grid} onSquareClick={onSquareClick}></GridLayer>
    </div>
  );
}
