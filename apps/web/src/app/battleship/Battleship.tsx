import { Battleship as BattleshipModel } from '@bship/contracts';
import classNames from 'classnames';
import { range } from 'lodash-es';
import './Battleship.css';

export interface BattleshipProps {
  model: BattleshipModel;
  onClick?: (model: BattleshipModel) => void;
}

export function Battleship({ model, onClick }: BattleshipProps) {
  return (
    <div
      className={classNames({
        battleship: true,
        vertical: model.orientation === 'v',
        horizontal: model.orientation === 'h',
      })}
      onClick={() => onClick?.(model)}
    >
      {range(model.size).map((index) => (
        <div
          key={index}
          className={classNames({
            'battleship-section': true,
            head: index === 0,
            tail: index === model.size - 1,
            hit: model.hitSections?.includes(index),
          })}
        >
          <div className="peg"></div>
        </div>
      ))}
    </div>
  );
}
