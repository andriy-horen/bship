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
          key={index}
          style={{
            top: `${ship.coordinates[0] * 24}px`,
            left: `${ship.coordinates[1] * 24}px`,
          }}
          className={`ship ship-size-${ship.size} ship-orientation-${ship.orientation}`}
        ></div>
      ))}
    </div>
  );
}
