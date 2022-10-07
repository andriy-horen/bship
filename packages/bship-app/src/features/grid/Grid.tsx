import { GridSquare } from '../game/gameSlice';
import './Grid.css';

export interface GridProps {
  grid: GridSquare[][];
  onSquareClick?: (x: number, y: number) => void;
}

export function Grid({ grid, onSquareClick }: GridProps) {
  const gridSize = 10;

  const classes = new Map<GridSquare, string>([
    [GridSquare.Hit, 'square-hit'],
    [GridSquare.Miss, 'square-miss'],
  ]);

  const getClassName = (x: number, y: number): string => {
    const square = grid[x][y];
    return classes.get(square) ?? '';
  };

  const get2DIndicies = (index: number): [number, number] => {
    return [Math.floor(index / 10), index % 10];
  };

  return (
    <div className="grid">
      {Array(gridSize * gridSize)
        .fill(0)
        .map((_, index) => {
          const [x, y] = get2DIndicies(index);

          return (
            <div key={index} className={getClassName(x, y)} onClick={() => onSquareClick?.(x, y)}>
              &nbsp;
            </div>
          );
        })}
    </div>
  );
}
