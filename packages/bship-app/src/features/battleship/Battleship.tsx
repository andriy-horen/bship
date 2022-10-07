import classNames from 'classnames';
import { range } from 'lodash-es';
import { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ItemTypes } from '../dnd/itemTypes';
import './Battleship.css';

export interface BattleshipProps {
  size: number;
  orientation: 'v' | 'h';
  position: [number, number];
  onClick?: (position: [number, number], orientation: 'v' | 'h') => void;
}

export function Battleship({ size, orientation, position, onClick }: BattleshipProps) {
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.Battleship,
      item: { size, orientation, position },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [position, orientation]
  );

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  return (
    <div
      ref={drag}
      className={classNames({
        battleship: true,
        vertical: orientation === 'v',
        horizontal: orientation === 'h',
      })}
      onClick={() => onClick?.(position, orientation)}
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
