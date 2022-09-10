import { useDrop } from "react-dnd";
import { ItemTypes } from "../../app/item-types";
import { Battleship } from "../battleship/Battleship";
import { Ship } from "../game/gameSlice";
import "./FleetGrid.css";

export interface FleetGridProps {
  fleet: Ship[];
}

export function FleetGrid({ fleet }: FleetGridProps) {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.Battleship,
    drop: () => {
      console.log("droppped");
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
          ></Battleship>
        </div>
      ))}
    </div>
  );
}
