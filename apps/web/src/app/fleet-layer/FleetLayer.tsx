import { Battleship as BattleshipModel } from '@bship/contracts';
import { Battleship } from '../battleship/Battleship';
import './FleetLayer.css';

export interface FleetLayerProps {
  fleet: BattleshipModel[];
}

export function FleetLayer({ fleet }: FleetLayerProps) {
  return (
    <div className="fleet-layer">
      {fleet.map((ship, index) => (
        <div
          key={index}
          className="ship-location"
          style={{
            top: `${ship.coordinates.y * 24 + ship.coordinates.y}px`,
            left: `${ship.coordinates.x * 24 + ship.coordinates.x}px`,
          }}
        >
          <Battleship model={ship}></Battleship>
        </div>
      ))}
    </div>
  );
}
