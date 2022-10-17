import { Battleship, Point } from 'bship-contracts';
import { range } from 'lodash-es';
import { FleetLayer } from '../fleet-layer/FleetLayer';
import { GridLayer, GridSquare } from '../grid-layer/GridLayer';
import './Grid.css';

export interface GridProps {
  fleet: Battleship[];
  grid: GridSquare[][];
  onSquareClick: (coordinates: Point) => void;
}

export function Grid({ fleet, grid, onSquareClick }: GridProps) {
  return (
    <div>
      <div className="vertical-labels">
        {Array.from('ABCDEFGHIJ').map((label) => (
          <div>{label}</div>
        ))}
      </div>
      <FleetLayer fleet={fleet}></FleetLayer>
      <GridLayer grid={grid} onSquareClick={onSquareClick}></GridLayer>
      <div className="horizontal-labels">
        {range(1, 11).map((label) => (
          <div>{label}</div>
        ))}
      </div>
    </div>
  );
}
