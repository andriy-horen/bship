import { Container, Header } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { Coordinates, GameMessageType, GameResponseType } from 'bship-contracts';
import { noop } from 'lodash-es';
import { nanoid } from 'nanoid';
import { useCallback, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import useWebSocket from 'react-use-websocket';
import './App.css';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { CustomDragLayer } from './features/dnd/CustomDragLayer';
import { FleetGrid } from './features/fleet-grid/FleetGrid';
import {
  addMoveUpdateFleet,
  gameReset,
  gameStarted,
  GameStatus,
  selectGameStatus,
  selectOpponentFleet,
  selectOpponentGrid,
  selectPlayerFleet,
  selectPlayerGrid,
  waitingForOpponent,
} from './features/game/gameEventSlice';
import { GridLayer } from './features/grid-layer/GridLayer';
import { Grid } from './features/grid/Grid';
import { PlayButtonsContainer } from './features/play-buttons/PlayButtonsContainer';
import { toBattleshipCoord } from './utils';

function App() {
  const dispatch = useAppDispatch();
  const playerGrid = useAppSelector(selectPlayerGrid);
  const opponentGrid = useAppSelector(selectOpponentGrid);
  const playerFleet = useAppSelector(selectPlayerFleet);
  const opponentFleet = useAppSelector(selectOpponentFleet);
  const gameStatus = useAppSelector(selectGameStatus);

  const websocketUrl = 'ws://192.168.0.100:3001/game';
  const [websocketId] = useState(nanoid(21));
  const [connect, setConnect] = useState(false);

  const { sendJsonMessage } = useWebSocket(
    websocketUrl,
    {
      queryParams: { id: websocketId },
      share: true,
      onMessage({ data }) {
        if (!data) return;

        const message = JSON.parse(data);
        switch (message.event) {
          case GameResponseType.Mark:
            dispatch(addMoveUpdateFleet(message.data));
            return;
          case GameResponseType.WaitForOpponent:
            dispatch(waitingForOpponent());
            return;
          case GameResponseType.GameStarted:
            dispatch(gameStarted(message.data.gameId));
            showNotification(
              message.data.next
                ? {
                    title: 'Game started',
                    message: 'You go first. Good luck!',
                    color: 'green',
                  }
                : {
                    title: 'Game started',
                    message: 'Opponent goes first. Good luck!',
                    color: 'green',
                  }
            );
            return;

          case GameResponseType.GameCompleted:
            dispatch(gameReset());
            showNotification(
              message.data.won
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
                  }
            );
            return;
          case GameResponseType.GameAborted:
            dispatch(gameReset());
            showNotification({
              title: 'Game Aborted',
              message: 'Just start a new one, duh',
              color: 'red',
            });
            return;
        }
      },
      onOpen() {},
      onClose() {},
    },
    connect
  );

  const handleSquareClick = useCallback((coordinates: Coordinates) => {
    sendJsonMessage({
      event: GameMessageType.Move,
      data: {
        coordinates,
      },
    } as any);
  }, []);

  const startGame = useCallback(() => {
    setConnect(true);
    sendJsonMessage({
      event: GameMessageType.CreateGame,
      data: {
        fleet: playerFleet.map((ship) => toBattleshipCoord(ship)),
      },
    } as any);
  }, []);

  function getPlayerGrid() {
    if (gameStatus === GameStatus.None) {
      return (
        <div className="player-grid">
          <DndProvider backend={HTML5Backend}>
            <FleetGrid fleet={playerFleet} />
            <CustomDragLayer />
          </DndProvider>
          <GridLayer grid={playerGrid} />
        </div>
      );
    }

    return <Grid fleet={playerFleet} grid={playerGrid} onSquareClick={noop} />;
  }

  return (
    <Container>
      <Header height={40}>
        <h3>bship.org</h3>
      </Header>

      <div className="grids-container">
        <div className="grid-player">
          <div>You</div>
          {getPlayerGrid()}
        </div>
        <div className="grid-opponent">
          <div>Opponent</div>
          <Grid fleet={opponentFleet} grid={opponentGrid} onSquareClick={handleSquareClick} />
        </div>

        <div className="buttons-container">
          <PlayButtonsContainer
            gameStatus={gameStatus}
            onPlayOnlineClick={startGame}
            onPlayComputerClick={noop}
          ></PlayButtonsContainer>
        </div>
      </div>
    </Container>
  );
}

export default App;
