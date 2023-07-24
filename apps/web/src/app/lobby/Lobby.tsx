import { Button, Flex, Group } from '@mantine/core';
import { FunctionComponent, useState } from 'react';
import { shallow } from 'zustand/shallow';
import { GameWebsocket } from '../game/use-game-websocket';
import { EditGrid } from '../grids/edit-grid/EditGrid';
import { selectPlayerGrid, useGameStore } from '../store/gameStore';

export interface LobbyProps {
  ws: GameWebsocket;
}

export const Lobby: FunctionComponent<LobbyProps> = ({ ws }) => {
  const [playerFleet, gameUpdates] = useGameStore(
    (state) => [state.playerFleet, state.gameUpdates],
    shallow,
  );

  const [gameReset] = useGameStore((state) => [state.gameReset], shallow);
  const playerGrid = selectPlayerGrid(gameUpdates);
  // const opponentGrid = selectOpponentGrid(gameUpdates);
  // const opponentFleet = selectOpponentFleet(gameUpdates);

  const [inProgress, setInProgress] = useState(false);

  const startGame = () => {
    setInProgress(!inProgress);
    gameReset();
    ws.createGame(playerFleet);
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
