import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import {
  BattleshipCoord,
  Coordinates,
  GameMessageType,
  GameResponseType,
  MoveStatus,
} from 'bship-contracts';
import { range } from 'lodash-es';
import { useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { CustomDragLayer } from './features/dnd/CustomDragLayer';
import { FleetGrid } from './features/fleet-grid/FleetGrid';
import {
  addOpponentShip,
  selectOpponentFleet,
  selectOpponentGrid,
  selectPlayerFleet,
  selectPlayerGrid,
  setOpponentSquare,
  setPlayerSquare,
  SetSquarePayload,
} from './features/game/gameSlice';
import { GridLayer, GridSquare } from './features/grid-layer/GridLayer';
import { Grid } from './features/grid/Grid';
import { getAround, getCorners, toBattleshipCoord, toBattleshipModel } from './utils';

function App() {
  const dispatch = useAppDispatch();
  const playerGrid = useAppSelector(selectPlayerGrid);
  const opponentGrid = useAppSelector(selectOpponentGrid);

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
        if (message.event !== GameResponseType.Mark) return;

        const action = message.data.self ? setPlayerSquare : setOpponentSquare;
        const coordinates = message.data.coordinates;

        switch (message.data.value) {
          case MoveStatus.Miss:
            dispatch(action({ value: GridSquare.Miss, coordinates }));
            break;
          case MoveStatus.Hit:
            dispatch(action({ value: GridSquare.Hit, coordinates }));
            markCorners(coordinates, action);
            break;
          case MoveStatus.Sunk:
            markAround(message.data.target, action);
            dispatch(action({ value: GridSquare.Hit, coordinates }));
            if (!message.data.self) {
              const model = toBattleshipModel(message.data.target);
              model.hitSections = range(0, model.size);
              dispatch(addOpponentShip({ battleship: model }));
            }
            break;
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

  const markCorners = (
    coord: Coordinates,
    action: ActionCreatorWithPayload<SetSquarePayload, string>
  ) => {
    getCorners(coord).forEach((coord) => {
      dispatch(action({ coordinates: coord, value: GridSquare.Miss }));
    });
  };

  const markAround = (
    ship: BattleshipCoord,
    action: ActionCreatorWithPayload<SetSquarePayload, string>
  ) => {
    getAround(ship).forEach((coord) => {
      dispatch(action({ coordinates: coord, value: GridSquare.Miss }));
    });
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

  return (
    <div className="App">
      <div>
        <h3>Player's Grid</h3>
        <div className="player-grid">
          <DndProvider backend={HTML5Backend}>
            <FleetGrid fleet={playerFleet} />
            <CustomDragLayer />
          </DndProvider>
          <GridLayer grid={playerGrid} />
        </div>
      </div>

      <div>
        <h3>Opponent's Grid</h3>
        <Grid fleet={opponentFleet} grid={opponentGrid} onSquareClick={handleSquareClick} />
      </div>
      <button onClick={startGame}>Play!</button>
    </div>
  );
}

export default App;
