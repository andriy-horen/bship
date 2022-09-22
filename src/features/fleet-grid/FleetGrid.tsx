import { useDrop } from "react-dnd";
import { ItemTypes } from "../dnd/itemTypes";
import { Battleship } from "../battleship/Battleship";
import { setShipPosition, Ship } from "../game/gameSlice";
import "./FleetGrid.css";
import { BattleshipDrag } from "../dnd/battleshipDrag";
import { snapToGrid } from "../dnd/snap";
import { store } from "../../app/store";

export interface FleetGridProps {
  fleet: Ship[];
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
          currentPosition: item.position,
          newPosition: [item.position[0] + y / 25, item.position[1] + x / 25],
        })
      );
    },
  }));

  return (
    <div ref={drop} className="fleet-grid">
      {fleet.map((ship, index) => (
        <div
          key={index}
          className="ship-location"
          style={{
            top: `${ship.position[0] * 24 + ship.position[0]}px`,
            left: `${ship.position[1] * 24 + ship.position[1]}px`,
          }}
        >
          <Battleship
            size={ship.size}
            orientation={ship.orientation}
            position={ship.position}
          ></Battleship>
        </div>
      ))}
    </div>
  );
}
