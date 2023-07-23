import { Button, Flex, Group } from '@mantine/core';
import React, { useState } from 'react';
import { shallow } from 'zustand/shallow';
import { EditGrid } from '../grids/edit-grid/EditGrid';
import useGameStore, { selectPlayerGrid } from '../store/gameStore';

export const Lobby: React.FunctionComponent = () => {
  const [playerFleet, gameUpdates] = useGameStore(
    (state) => [state.playerFleet, state.gameUpdates],
    shallow,
  );
  const playerGrid = selectPlayerGrid(gameUpdates);

  const [inProgress, setInProgress] = useState(false);

  const startGame = () => {
    setInProgress(!inProgress);
  };

  return (
    <Flex gap="md">
      <EditGrid readonly={inProgress} fleet={playerFleet} grid={playerGrid}></EditGrid>
      <div>
        <Group mt={8}>
          <Button loading={inProgress} color="green" onClick={startGame}>
            {inProgress ? 'Waiting for Opponent' : 'Play Online'}
          </Button>
        </Group>
        <Group mt={8}>
          <Button disabled={inProgress} color="green">
            Play a Friend
          </Button>
        </Group>
        <Group mt={8}>
          <Button disabled={inProgress} color="dark">
            Play Computer
          </Button>
        </Group>
      </div>
    </Flex>
  );
};
