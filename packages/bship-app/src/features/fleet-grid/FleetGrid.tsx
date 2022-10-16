import { Battleship as BattleshipModel, Coordinates } from 'bship-contracts';
import { useDrop } from 'react-dnd';
import { store } from '../../app/store';
import { DraggableBattleship } from '../battleship/DraggableBattleship';
import { ItemTypes } from '../dnd/itemTypes';
import { snapToGrid } from '../dnd/snap';
import { toggleShipOrientation, updateShipPosition } from '../game/gameEventSlice';
import './FleetGrid.css';

export interface FleetGridProps {
  fleet: BattleshipModel[];
}

export function FleetGrid({ fleet }: FleetGridProps) {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.Battleship,
    drop(item: BattleshipModel, monitor) {
      const delta = monitor.getDifferenceFromInitialOffset() as {
        x: number;
        y: number;
      };

      const [x, y] = snapToGrid([delta.x, delta.y], 25);

      store.dispatch(
        updateShipPosition({
          currentCoord: item.coordinates,
          newCoord: { x: item.coordinates.x + x / 25, y: item.coordinates.y + y / 25 },
        })
      );
    },
  }));

  const toggleOrientation = (coordinates: Coordinates) => {
    store.dispatch(toggleShipOrientation(coordinates));
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
          <DraggableBattleship model={ship} onClick={toggleOrientation}></DraggableBattleship>
        </div>
      ))}
    </div>
  );
}
