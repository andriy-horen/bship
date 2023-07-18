import React from 'react';
import { shallow } from 'zustand/shallow';
import { EditGrid } from '../grids/edit-grid/EditGrid';
import useGameStore, { selectPlayerGrid } from '../store/gameStore';

export const Lobby: React.FunctionComponent = () => {
  const [playerFleet, gameUpdates] = useGameStore(
    (state) => [state.playerFleet, state.gameUpdates],
    shallow,
  );
  const playerGrid = selectPlayerGrid(gameUpdates);

  return <EditGrid fleet={playerFleet} grid={playerGrid}></EditGrid>;
};
