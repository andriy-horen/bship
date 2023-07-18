import { Battleship, Point } from '@bship/contracts';
import { FleetLayer } from '../fleet-layer/FleetLayer';
import { GridLabels } from '../grid-labels/GridLabels';
import { GridLayer, GridSquare } from '../grid-layer/GridLayer';
import './PlayGrid.css';

export interface PlayGridProps {
  fleet: Battleship[];
  grid: GridSquare[][];
  onSquareClick: (coordinates: Point) => void;
}

export function PlayGrid({ fleet, grid, onSquareClick }: PlayGridProps) {
  return (
    <GridLabels>
      <FleetLayer fleet={fleet}></FleetLayer>
      <GridLayer grid={grid} onSquareClick={onSquareClick}></GridLayer>
    </GridLabels>
  );
}
