import {
  Battleship as BattleshipModel,
  expandBy,
  intersects,
  isEqual,
  Point,
  Rect,
} from 'bship-contracts';
import classNames from 'classnames';
import { useState } from 'react';
import { useDrop } from 'react-dnd';
import { shallow } from 'zustand/shallow';
import useGameStore from '../../app/gameStore';
import { isValidCoordinate, toRect } from '../../utils';
import { DraggableBattleship } from '../battleship/DraggableBattleship';
import { ItemTypes } from '../dnd/itemTypes';
import { snapToGrid } from '../dnd/snap';
import './FleetGrid.css';

export interface FleetGridProps {
  fleet: BattleshipModel[];
}

export function FleetGrid({ fleet }: FleetGridProps) {
  const getDropCoordinates = (current: Point, delta: Point): Point => {
    const [x, y] = snapToGrid([delta.x, delta.y], 25);
    return { x: current.x + x / 25, y: current.y + y / 25 };
  };

  const isValidNewPosition = (newShip: Rect, current: Point) => {
    const validCoordinates = newShip.every((coord) => isValidCoordinate(coord));
    const intersectsOthers = playerFleet.some(
      (ship) =>
        !isEqual(ship.coordinates, current) && intersects(expandBy(toRect(ship), 1), newShip)
    );

    return validCoordinates && !intersectsOthers;
  };

  const playerFleet = useGameStore((state) => state.playerFleet);
  const [toggleShipOrientation, updateShipPosition] = useGameStore(
    (state) => [state.toggleShipOrientation, state.updateShipPosition],
    shallow
  );

  const [, drop] = useDrop(
    () => ({
      accept: ItemTypes.Battleship,
      drop(item: BattleshipModel, monitor) {
        const delta = monitor.getDifferenceFromInitialOffset() as { x: number; y: number };

        updateShipPosition({
          currentCoord: item.coordinates,
          newCoord: getDropCoordinates(item.coordinates, delta),
        });
      },
      canDrop(item, monitor) {
        const delta = monitor.getDifferenceFromInitialOffset() as { x: number; y: number };
        const newCoord = getDropCoordinates(item.coordinates, delta);
        const dropShip = toRect({ ...item, coordinates: newCoord });

        return isValidNewPosition(dropShip, item.coordinates);
      },
    }),
    [playerFleet]
  );

  const [shipErrorAnimation, setShipErrorAnimation] = useState<number>();

  const toggleOrientation = (model: BattleshipModel, index: number) => {
    const updated: BattleshipModel = {
      ...model,
      orientation: model.orientation === 'h' ? 'v' : 'h',
    };

    if (!isValidNewPosition(toRect(updated), model.coordinates)) {
      return setShipErrorAnimation(index);
    }

    toggleShipOrientation(model.coordinates);
  };

  return (
    <div ref={drop} className="fleet-grid">
      {fleet.map((ship, index) => (
        <div
          key={index}
          className={classNames('ship-location', {
            'ship-error-animate': shipErrorAnimation === index,
          })}
          onAnimationEnd={() => setShipErrorAnimation(undefined)}
          style={{
            top: `${ship.coordinates.y * 24 + ship.coordinates.y}px`,
            left: `${ship.coordinates.x * 24 + ship.coordinates.x}px`,
          }}
        >
          <DraggableBattleship
            model={ship}
            onClick={(model) => toggleOrientation(model, index)}
          ></DraggableBattleship>
        </div>
      ))}
    </div>
  );
}
