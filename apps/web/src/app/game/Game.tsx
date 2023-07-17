import { GameMessage, GameMessageType, PING, Point } from '@bship/contracts';
import { modals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { noop, range } from 'lodash-es';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import useWebSocket from 'react-use-websocket';
import { shallow } from 'zustand/shallow';
import { CustomDragLayer } from '../dnd/CustomDragLayer';
import { FleetGrid } from '../fleet-grid/FleetGrid';
import { GridLayer } from '../grid-layer/GridLayer';
import { Grid } from '../grid/Grid';
import { PlayButtonsContainer } from '../play-buttons/PlayButtonsContainer';
import useGameStore, {
  GameStatus,
  selectOpponentFleet,
  selectOpponentGrid,
  selectPlayerGrid,
} from '../store/gameStore';
import { UserVersus } from '../user-versus/UserVersus';
import { toRect } from '../utils';
import './game.css';

function App() {
  const [gameStatus, playerFleet, gameUpdates] = useGameStore(
    (state) => [state.status, state.playerFleet, state.gameUpdates],
    shallow,
  );

  const [addUpdate, waitingForOpponent, gameStarted, gameReset] = useGameStore(
    (state) => [state.addUpdate, state.waitingForOpponent, state.gameStarted, state.gameReset],
    shallow,
  );

  const playerGrid = selectPlayerGrid(gameUpdates);
  const opponentGrid = selectOpponentGrid(gameUpdates);
  const opponentFleet = selectOpponentFleet(gameUpdates);

  // const userIsEmpty = useAppSelector(selectUserIsEmpty);

  const [websocketUrl] = useState(
    `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/game`,
  );
  const [websocketId, setWebsocketId] = useState(nanoid(21));
  const [connect, setConnect] = useState(false);

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
            addUpdate(message.data);
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
                    },
              );
            }
            break;
          case GameMessageType.WaitForOpponent:
            waitingForOpponent();
            break;
          case GameMessageType.GameStarted:
            gameStarted(message.data.gameId);
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
                  },
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
      onClose() {
        if (gameStatus === GameStatus.GameStarted) {
          gameReset();
          showNotification({
            title: 'Disconnect',
            message: 'Try starting new game',
            color: 'red',
          });
        }
      },
    },
    connect,
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
      innerProps: {
        onSubmit: () => {
          console.log('submit!');
        },
      },
    });

  const startGame = () => {
    gameReset();

    // if (userIsEmpty) {
    //   openModal();
    // }

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
    <>
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
    </>
  );
}

export default App;
