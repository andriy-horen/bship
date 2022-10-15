import { Button, Container, Header } from '@mantine/core';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { IconDeviceDesktop, IconShip } from '@tabler/icons';
import {
  BattleshipCoord,
  Coordinates,
  GameMessageType,
  GameResponseType,
  MarkPayload,
  MoveStatus,
} from 'bship-contracts';
import { noop, range } from 'lodash-es';
import { useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { CustomDragLayer } from './features/dnd/CustomDragLayer';
import { FleetGrid } from './features/fleet-grid/FleetGrid';
import {
  addOpponentShip,
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
import { getAround, getCorners, toBattleshipCoord, toBattleshipModel } from './utils';

function App() {
  const dispatch = useAppDispatch();
  const playerGrid = useAppSelector(selectPlayerGrid);
  const opponentGrid = useAppSelector(selectOpponentGrid);
  const currentGame = useAppSelector(selectCurrentGame);

  const websocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (websocket.current) return;

    const ws = new WebSocket(`ws://192.168.0.100:3001/game`);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          event: GameMessageType.Connect,
        })
      );

      ws.onmessage = ({ data }) => {
        // TODO: optimize everything here
        if (!data) return;
        const message = JSON.parse(data);

        switch (message.event) {
          case GameResponseType.Mark:
            return handleMarkMessage(message.data);
          case GameResponseType.GameStarted:
            dispatch(updateCurrentGame({ gameId: message.data.gameId, started: true }));
            return;
        }
      };
    };

    websocket.current = ws;

    // TODO: in general clean-up is needed but not in case of root-level component
    // return () => {
    //   ws.close();
    // };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleSquareClick = (coordinates: Coordinates) => {
    websocket.current?.send(
      JSON.stringify({
        event: GameMessageType.Move,
        data: {
          coordinates,
        },
      })
    );
  };

  const playerFleet = useAppSelector(selectPlayerFleet);
  const opponentFleet = useAppSelector(selectOpponentFleet);

  const startGame = () => {
    websocket?.current?.send(
      JSON.stringify({
        event: GameMessageType.CreateGame,
        data: {
          fleet: playerFleet.map((ship) => toBattleshipCoord(ship)),
        },
      })
    );
  };

  function getPlayerGrid() {
    if (!currentGame.hasStarted) {
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
      <Header height={60}>
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
          <Button color="green" disabled={currentGame.hasStarted} onClick={startGame}>
            <IconShip size={18}></IconShip>
            {/* Waiting for opponent <Loader color="white" size="xs" /> */}
            Play online
          </Button>
          <Button color="dark">
            {/* Waiting for opponent <Loader color="white" size="xs" /> */}
            <IconDeviceDesktop size={18}></IconDeviceDesktop>
            Play computer
          </Button>
        </div>
      </div>
    </Container>
  );
}

export default App;
