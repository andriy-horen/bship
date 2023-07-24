import { showNotification } from '@mantine/notifications';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { shallow } from 'zustand/shallow';
import { AppLayout } from './app-layout/AppLayout';
import { Game } from './game/Game';
import { useGameWebsocket } from './game/use-game-websocket';
import { Lobby } from './lobby/Lobby';
import { GameStatus, useGameStore } from './store/gameStore';

export function App() {
  const navigate = useNavigate();

  const [gameStatus] = useGameStore((state) => [state.status], shallow);

  const [addUpdate, waitingForOpponent, gameStarted, gameReset] = useGameStore(
    (state) => [state.addUpdate, state.waitingForOpponent, state.gameStarted, state.gameReset],
    shallow,
  );

  const gameWebsocket = useGameWebsocket(
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

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Lobby ws={gameWebsocket} />} />
        <Route path="/game/:gameId" element={<Game ws={gameWebsocket} />} />
      </Routes>
    </AppLayout>
  );
}
