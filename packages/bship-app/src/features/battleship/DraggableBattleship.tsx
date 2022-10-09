import { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ItemTypes } from '../dnd/itemTypes';
import { Battleship, BattleshipProps } from './Battleship';

export function DraggableBattleship({ model, onClick }: BattleshipProps) {
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.Battleship,
      item: model,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [model.coordinates, model.orientation]
  );

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  return (
    <div ref={drag}>
      <Battleship model={model} onClick={onClick}></Battleship>
    </div>
  );
}
