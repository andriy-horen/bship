import { useDrop } from "react-dnd";
import { ItemTypes } from "../dnd/itemTypes";
import { Battleship } from "../battleship/Battleship";
import { setShipOrientation, setShipPosition } from "../game/gameSlice";
import "./FleetGrid.css";
import { BattleshipDrag } from "../dnd/battleshipDrag";
import { snapToGrid } from "../dnd/snap";
import { store } from "../../app/store";
import { Battleship as BattleshipModel } from "bship-contracts";

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
          currentPosition: item.position,
          newPosition: [item.position[0] + y / 25, item.position[1] + x / 25],
        })
      );
    },
  }));

  const changeOrientation = (
    position: [number, number],
    orientation: "v" | "h"
  ) => {
    store.dispatch(
      setShipOrientation({
        position,
        orientation: orientation === "v" ? "h" : "v",
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
            top: `${ship.position[0] * 24 + ship.position[0]}px`,
            left: `${ship.position[1] * 24 + ship.position[1]}px`,
          }}
        >
          <Battleship
            size={ship.size}
            orientation={ship.orientation}
            position={ship.position}
            onClick={changeOrientation}
          ></Battleship>
        </div>
      ))}
    </div>
  );
}
