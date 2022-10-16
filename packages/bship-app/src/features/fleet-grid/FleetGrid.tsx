import { Battleship as BattleshipModel, BattleshipCoord, Coordinates } from 'bship-contracts';
import { useDrop } from 'react-dnd';
import { useAppSelector } from '../../app/hooks';
import { store } from '../../app/store';
import { isEqual } from '../../coordinates';
import { getShipBox, isValidCoordinate, shipsIntersect, toBattleshipCoord } from '../../utils';
import { DraggableBattleship } from '../battleship/DraggableBattleship';
import { ItemTypes } from '../dnd/itemTypes';
import { snapToGrid } from '../dnd/snap';
import {
  selectPlayerFleet,
  toggleShipOrientation,
  updateShipPosition,
} from '../game/gameEventSlice';
import './FleetGrid.css';

export interface FleetGridProps {
  fleet: BattleshipModel[];
}

export function FleetGrid({ fleet }: FleetGridProps) {
  const getDropCoordinates = (current: Coordinates, delta: Coordinates): Coordinates => {
    const [x, y] = snapToGrid([delta.x, delta.y], 25);
    return { x: current.x + x / 25, y: current.y + y / 25 };
  };

  const validateNewPosition = (newShip: BattleshipCoord, current: Coordinates) => {
    if (!newShip.every((coord) => isValidCoordinate(coord))) {
      return false;
    }
    if (
      playerFleet.some(
        (ship) =>
          !isEqual(ship.coordinates, current) &&
          shipsIntersect(getShipBox(toBattleshipCoord(ship)), newShip)
      )
    ) {
      return false;
    }
    return true;
  };

  const playerFleet = useAppSelector(selectPlayerFleet);

  const [, drop] = useDrop(
    () => ({
      accept: ItemTypes.Battleship,
      drop(item: BattleshipModel, monitor) {
        const delta = monitor.getDifferenceFromInitialOffset() as { x: number; y: number };

        store.dispatch(
          updateShipPosition({
            currentCoord: item.coordinates,
            newCoord: getDropCoordinates(item.coordinates, delta),
          })
        );
      },
      canDrop(item, monitor) {
        const delta = monitor.getDifferenceFromInitialOffset() as { x: number; y: number };
        const newCoord = getDropCoordinates(item.coordinates, delta);
        const dropShip = toBattleshipCoord({ ...item, coordinates: newCoord });

        return validateNewPosition(dropShip, item.coordinates);
      },
    }),
    [playerFleet]
  );

  const toggleOrientation = (model: BattleshipModel) => {
    const updated = {
      ...model,
      orientation: model.orientation === 'h' ? 'v' : 'h',
    } as BattleshipModel;
    if (validateNewPosition(toBattleshipCoord(updated), model.coordinates)) {
      store.dispatch(toggleShipOrientation(model.coordinates));
    }
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
