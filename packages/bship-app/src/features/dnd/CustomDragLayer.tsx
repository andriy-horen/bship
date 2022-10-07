import type { CSSProperties, FC } from 'react';
import type { XYCoord } from 'react-dnd';
import { useDragLayer } from 'react-dnd';
import { ItemTypes } from './itemTypes';

import { Battleship } from '../battleship/Battleship';
import { BattleshipDrag } from './battleshipDrag';
import { snapToGrid } from './snap';

const layerStyles: CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  opacity: 0.5,
};

function getItemStyles(initialOffset: XYCoord | null, currentOffset: XYCoord | null) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }

  let { x, y } = currentOffset;

  x -= initialOffset.x;
  y -= initialOffset.y;
  [x, y] = snapToGrid([x, y], 25);
  x += initialOffset.x;
  y += initialOffset.y;

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

export const CustomDragLayer: FC = () => {
  const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem<BattleshipDrag>(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  function renderItem() {
    switch (itemType) {
      case ItemTypes.Battleship:
        return (
          <Battleship size={item.size} orientation={item.orientation} position={item.position} />
        );
      default:
        return null;
    }
  }

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset)}>{renderItem()}</div>
    </div>
  );
};
