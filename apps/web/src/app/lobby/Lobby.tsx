import { shallow } from 'zustand/shallow';
import { FleetGrid } from '../grids/fleet-grid/FleetGrid';
import useGameStore from '../store/gameStore';

export function Lobby() {
  const playerFleet = useGameStore((state) => state.playerFleet, shallow);

  return <FleetGrid fleet={playerFleet}></FleetGrid>;
}
