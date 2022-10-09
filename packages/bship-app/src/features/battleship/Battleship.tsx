import { Battleship as BattleshipModel, Coordinates, Orientation } from 'bship-contracts';
import classNames from 'classnames';
import { range } from 'lodash-es';
import './Battleship.css';

export interface BattleshipProps {
  model: BattleshipModel;
  onClick?: (coordinates: Coordinates, orientation: Orientation) => void;
}

export function Battleship({
  model: { size, orientation, coordinates },
  onClick,
}: BattleshipProps) {
  return (
    <div
      className={classNames({
        battleship: true,
        vertical: orientation === 'v',
        horizontal: orientation === 'h',
      })}
      onClick={() => onClick?.(coordinates, orientation)}
    >
      {range(size).map((index) => (
        <div
          key={index}
          className={classNames({
            'battleship-section': true,
            head: index === 0,
            tail: index === size - 1,
          })}
        ></div>
      ))}
    </div>
  );
}
