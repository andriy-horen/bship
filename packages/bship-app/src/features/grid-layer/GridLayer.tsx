import { Coordinates } from 'bship-contracts';
import './GridLayer.css';

export enum GridSquare {
  Empty,
  Miss,
  Hit,
  Sunk,
}

export interface GridProps {
  grid: GridSquare[][];
  onSquareClick?: (coordinates: Coordinates) => void;
}

export function GridLayer({ grid, onSquareClick }: GridProps) {
  const gridSize = 10;

  const classes = new Map<GridSquare, string>([
    [GridSquare.Hit, 'square-hit'],
    [GridSquare.Miss, 'square-miss'],
    [GridSquare.Sunk, 'square-sunk'],
  ]);

  const getClassName = ({ x, y }: Coordinates): string => {
    const square = grid[y][x];
    return classes.get(square) ?? '';
  };

  const get2DIndicies = (index: number): Coordinates => {
    return { x: index % 10, y: Math.floor(index / 10) };
  };

  return (
    <div className="grid">
      {Array(gridSize * gridSize)
        .fill(0)
        .map((_, index) => {
          const coord = get2DIndicies(index);

          return (
            <div key={index} className={getClassName(coord)} onClick={() => onSquareClick?.(coord)}>
              &nbsp;
            </div>
          );
        })}
    </div>
  );
}
