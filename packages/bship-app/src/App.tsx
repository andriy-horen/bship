import { Container, Header } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import {
  BattleshipCoord,
  Coordinates,
  GameMessageType,
  GameResponseType,
  MarkPayload,
  MoveStatus,
} from 'bship-contracts';
import { noop, range } from 'lodash-es';
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
  addOpponentShip,
  CurrentGameStatus,
  selectCurrentGame,
  selectOpponentFleet,
  selectOpponentGrid,
  selectPlayerFleet,
  selectPlayerGrid,
  setOpponentSquares,
  setPlayerSquares,
  setShipHitStatus,
  SetSquarePayload,
  updateCurrentGame,
} from './features/game/gameSlice';
import { GridLayer, GridSquare } from './features/grid-layer/GridLayer';
import { Grid } from './features/grid/Grid';
import { PlayButtonsContainer } from './features/play-buttons/PlayButtonsContainer';
import { getAround, getCorners, toBattleshipCoord, toBattleshipModel } from './utils';

function App() {
  const dispatch = useAppDispatch();
  const playerGrid = useAppSelector(selectPlayerGrid);
  const opponentGrid = useAppSelector(selectOpponentGrid);
  const currentGame = useAppSelector(selectCurrentGame);

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
            return handleMarkMessage(message.data);
          case GameResponseType.WaitForOpponent:
            dispatch(
              updateCurrentGame({ gameId: '', status: CurrentGameStatus.WaitingForOpponent })
            );
            return;
          case GameResponseType.GameStarted:
            dispatch(
              updateCurrentGame({
                gameId: message.data.gameId,
                status: CurrentGameStatus.GameStarted,
              })
            );
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
            dispatch(
              updateCurrentGame({
                gameId: '',
                status: CurrentGameStatus.None,
              })
            );
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
        }
      },
      onOpen() {},
      onClose() {},
    },
    connect
  );

  const handleMarkMessage = (data: MarkPayload) => {
    const action = data.self ? setPlayerSquares : setOpponentSquares;
    const coordinates = data.coordinates;

    switch (data.value) {
      case MoveStatus.Miss:
        dispatch(action({ squares: [{ value: GridSquare.Miss, coordinates }] }));
        break;
      case MoveStatus.Hit:
        hit(coordinates, data.self, action);
        markCorners(coordinates, action);
        if (!data.self && data.target) {
          const model = toBattleshipModel(data.target);
          model.hitSections = range(0, model.size);
          dispatch(addOpponentShip({ battleship: model }));
          markAround(data.target, action);
        }
        break;
    }
  };

  const markCorners = (
    coord: Coordinates,
    action: ActionCreatorWithPayload<SetSquarePayload, string>
  ) => {
    const squares = getCorners(coord).map((coord) => ({
      coordinates: coord,
      value: GridSquare.Miss,
    }));
    dispatch(action({ squares }));
  };

  const markAround = (
    ship: BattleshipCoord,
    action: ActionCreatorWithPayload<SetSquarePayload, string>
  ) => {
    const squares = getAround(ship).map((coord) => ({
      coordinates: coord,
      value: GridSquare.Miss,
    }));
    dispatch(action({ squares }));
  };

  const hit = (
    coordinates: Coordinates,
    isSelf: boolean,
    action: ActionCreatorWithPayload<SetSquarePayload, string>
  ) => {
    dispatch(action({ squares: [{ value: GridSquare.Hit, coordinates }] }));
    if (isSelf) {
      dispatch(setShipHitStatus({ coordinates }));
    }
  };

  const handleSquareClick = useCallback((coordinates: Coordinates) => {
    sendJsonMessage({
      event: GameMessageType.Move,
      data: {
        coordinates,
      },
    } as any);
  }, []);

  const playerFleet = useAppSelector(selectPlayerFleet);
  const opponentFleet = useAppSelector(selectOpponentFleet);

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
    if (currentGame.status === CurrentGameStatus.None) {
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
            gameStatus={currentGame.status}
            onPlayOnlineClick={startGame}
            onPlayComputerClick={noop}
          ></PlayButtonsContainer>
        </div>
      </div>
    </Container>
  );
}

export default App;
