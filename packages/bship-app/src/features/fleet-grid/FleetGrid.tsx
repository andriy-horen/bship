import { Battleship as BattleshipModel, Coordinates, Orientation } from 'bship-contracts';
import { useDrop } from 'react-dnd';
import { store } from '../../app/store';
import { DraggableBattleship } from '../battleship/DraggableBattleship';
import { BattleshipDrag } from '../dnd/battleshipDrag';
import { ItemTypes } from '../dnd/itemTypes';
import { snapToGrid } from '../dnd/snap';
import { setShipOrientation, setShipPosition } from '../game/gameSlice';
import './FleetGrid.css';

export interface FleetGridProps {
  fleet: BattleshipModel[];
}

export function FleetGrid({ fleet }: FleetGridProps) {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.Battleship,
    drop(item: BattleshipDrag, monitor) {
      const delta = monitor.getDifferenceFromInitialOffset() as {
        x: number;
        y: number;
      };

      const [x, y] = snapToGrid([delta.x, delta.y], 25);

      store.dispatch(
        setShipPosition({
          currentPosition: item.coordinates,
          newPosition: { x: item.coordinates.x + x / 25, y: item.coordinates.y + y / 25 },
        })
      );
    },
  }));

  const changeOrientation = (coordinates: Coordinates, orientation: Orientation) => {
    store.dispatch(
      setShipOrientation({
        coordinates,
        orientation: orientation === 'v' ? 'h' : 'v',
      })
    );
  };

  return (
    <div ref={drop} className="fleet-grid">
      {fleet.map((ship, index) => (
        <div
          key={index}
          className="ship-location"
          style={{
            top: `${ship.coordinates.y * 24 + ship.coordinates.y}px`,
            left: `${ship.coordinates.x * 24 + ship.coordinates.x}px`,
          }}
        >
          <DraggableBattleship model={ship} onClick={changeOrientation}></DraggableBattleship>
        </div>
      ))}
    </div>
  );
}
