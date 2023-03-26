import { Burger, Container, Group, Header } from '@mantine/core';
import { modals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { GameMessage, GameMessageType, PING, Point } from 'bship-contracts';
import { noop, range } from 'lodash-es';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import useWebSocket from 'react-use-websocket';
import './App.css';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { CustomDragLayer } from './features/dnd/CustomDragLayer';
import { FleetGrid } from './features/fleet-grid/FleetGrid';
import {
  addUpdateThunk as addUpdate,
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
import { PlayersOnline } from './features/players-online/PlayersOnline';
import { UserVersus } from './features/user-versus/UserVersus';
import { selectUserIsEmpty } from './features/user/userSlice';
import { toRect } from './utils';

function App() {
  const dispatch = useAppDispatch();
  const playerGrid = useAppSelector(selectPlayerGrid);
  const opponentGrid = useAppSelector(selectOpponentGrid);
  const playerFleet = useAppSelector(selectPlayerFleet);
  const opponentFleet = useAppSelector(selectOpponentFleet);
  const gameStatus = useAppSelector(selectGameStatus);
  const userIsEmpty = useAppSelector(selectUserIsEmpty);

  const [websocketUrl] = useState(
    `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/game`
  );
  const [websocketId, setWebsocketId] = useState(nanoid(21));
  const [connect, setConnect] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { sendJsonMessage, sendMessage } = useWebSocket(
    websocketUrl,
    {
      queryParams: { id: websocketId },
      share: true,
      onMessage({ data }) {
        if (!data) return;

        const message = JSON.parse(data) as GameMessage;
        switch (message.event) {
          case GameMessageType.GameUpdate:
            dispatch(addUpdate(message.data));
            if (message.data.won != null) {
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
            }
            break;
          case GameMessageType.WaitForOpponent:
            dispatch(waitingForOpponent());
            break;
          case GameMessageType.GameStarted:
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
            break;
          case GameMessageType.GameAborted:
            showNotification({
              title: 'Game Aborted',
              message: 'Just start a new one, duh',
              color: 'red',
            });
            break;
        }

        if (typeof message.seq === 'number') {
          sendJsonMessage({
            event: GameMessageType.Acknowledge,
            seq: message.seq,
          });
        }
      },
      onOpen() {},
      onClose() {
        if (gameStatus === GameStatus.GameStarted) {
          dispatch(gameReset());
          showNotification({
            title: 'Disconnect',
            message: 'Try starting new game',
            color: 'red',
          });
        }
      },
    },
    connect
  );

  useEffect(() => {
    if (gameStatus === GameStatus.None) {
      setConnect(false);
      setWebsocketId(nanoid(21));
    }

    const interval = setInterval(() => {
      if (gameStatus === GameStatus.None) {
        return;
      }
      sendMessage(PING, false);
    }, 5_000);
    return () => clearInterval(interval);
  }, [gameStatus, sendMessage]);

  const handleSquareClick = (coordinates: Point) => {
    sendJsonMessage({
      event: GameMessageType.GameEvent,
      data: {
        coordinates,
      },
    } as any);
  };

  // TODO: usernameModal string is a magic string and used also as mapping in index.tsx, needs to be extracted & refactored
  const openModal = () =>
    modals.openContextModal({
      modal: 'usernameModal',
      title: 'Player details',
      innerProps: {},
    });

  const startGame = () => {
    dispatch(gameReset());

    if (userIsEmpty) {
      openModal();
    }

    setConnect(true);
    sendJsonMessage({
      event: GameMessageType.CreateGame,
      data: {
        fleet: playerFleet.map((ship) => toRect(ship)),
      },
    } as any);
  };

  // TODO: extract editable grid
  function getPlayerGrid() {
    if (gameStatus === GameStatus.None) {
      return (
        <div className="player-grid">
          <div className="vertical-labels">
            {Array.from('ABCDEFGHIJ').map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>
          <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
            <FleetGrid fleet={playerFleet} />
            <CustomDragLayer />
          </DndProvider>
          <GridLayer grid={playerGrid} />
          <div className="horizontal-labels">
            {range(1, 11).map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>
        </div>
      );
    }

    return <Grid fleet={playerFleet} grid={playerGrid} onSquareClick={noop} />;
  }

  return (
    <Container>
      <Header height={56} mb={16}>
        <div
          style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Group>
            <Burger opened={menuOpen} onClick={() => setMenuOpen(!menuOpen)} aria-label={'nav'} />
          </Group>

          <Group>
            <PlayersOnline online={149}></PlayersOnline>
          </Group>
        </div>
      </Header>

      <UserVersus
        user1={{ username: 'mateusz', countryCode: 'PL' }}
        user2={{ username: 'kometa', countryCode: 'UA' }}
      ></UserVersus>

      <div className="grids-container">
        <div className="grid-player">{getPlayerGrid()}</div>
        <div className="grid-opponent">
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
