import { Button, Flex, Group } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shallow } from 'zustand/shallow';
import { useGameWebsocket } from '../game/use-game-websocket';
import { EditGrid } from '../grids/edit-grid/EditGrid';
import useGameStore, { GameStatus, selectPlayerGrid } from '../store/gameStore';

export const Lobby: React.FunctionComponent = () => {
  const navigate = useNavigate();

  const [gameStatus, playerFleet, gameUpdates] = useGameStore(
    (state) => [state.status, state.playerFleet, state.gameUpdates],
    shallow,
  );

  const [addUpdate, waitingForOpponent, gameStarted, gameReset] = useGameStore(
    (state) => [state.addUpdate, state.waitingForOpponent, state.gameStarted, state.gameReset],
    shallow,
  );
  const playerGrid = selectPlayerGrid(gameUpdates);
  // const opponentGrid = selectOpponentGrid(gameUpdates);
  // const opponentFleet = selectOpponentFleet(gameUpdates);

  const [inProgress, setInProgress] = useState(false);

  const ws = useGameWebsocket(
    {
      onGameUpdate({ data }) {
        addUpdate(data);
        if (data.won != null) {
          showNotification(
            data.won
              ? {
                  title: 'Game Over',
                  message: 'You won! Congrats GG EZ.',
                  color: 'green',
                  autoClose: false,
                }
              : {
                  title: 'Game Over',
                  message: 'You lost! Gonna cry?',
                  color: 'orange',
                  autoClose: false,
                },
          );
        }
      },
      onGameAborted() {
        showNotification({
          title: 'Game Aborted',
          message: 'Just start a new one, duh',
          color: 'red',
        });
      },
      onGameStarted({ data }) {
        gameStarted(data.gameId);
        navigate(`game/${data.gameId}`);
        showNotification(
          data.next
            ? {
                title: 'Game started',
                message: 'You go first. Good luck!',
                color: 'green',
              }
            : {
                title: 'Game started',
                message: 'Opponent goes first. Good luck!',
                color: 'green',
              },
        );
      },
      onWaitForOpponent() {
        waitingForOpponent();
      },
    },
    // onClose
    () => {
      if (gameStatus === GameStatus.GameStarted) {
        gameReset();
        showNotification({
          title: 'Disconnect',
          message: 'Try starting new game',
          color: 'red',
        });
      }
    },
  );

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
