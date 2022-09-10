import { Battleship } from "../battleship/Battleship";
import { Ship } from "../game/gameSlice";
import "./FleetGrid.css";

export interface FleetGridProps {
  fleet: Ship[];
}

export function FleetGrid({ fleet }: FleetGridProps) {
  return (
    <div className="fleet-grid">
      {fleet.map((ship, index) => (
        <div
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
