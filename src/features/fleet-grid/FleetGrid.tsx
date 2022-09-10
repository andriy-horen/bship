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
        <Battleship
          size={ship.size}
          orientation={ship.orientation}
        ></Battleship>
      ))}
    </div>
  );
}
