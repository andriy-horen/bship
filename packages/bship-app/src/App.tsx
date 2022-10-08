import { Coordinates, GameMessageType, GameResponseType, MoveStatus } from 'bship-contracts';
import { useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { CustomDragLayer } from './features/dnd/CustomDragLayer';
import { FleetGrid } from './features/fleet-grid/FleetGrid';
import {
  GridSquare,
  selectFleet,
  selectOpponentGrid,
  selectPlayerGrid,
  setOpponentSquare,
  setPlayerSquare,
} from './features/game/gameSlice';
import { Grid } from './features/grid/Grid';
import { toBattleshipCoord } from './utils';

function App() {
  const dispatch = useAppDispatch();
  const playerGrid = useAppSelector(selectPlayerGrid);
  const opponentGrid = useAppSelector(selectOpponentGrid);

  const websocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (websocket.current) return;

    const ws = new WebSocket(`ws://localhost:3001/game`);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          event: GameMessageType.Connect,
        })
      );

      ws.onmessage = ({ data }) => {
        if (!data) return;
        const message = JSON.parse(data);
        if (message.event !== GameResponseType.Mark) return;

        const action = message.data.self ? setPlayerSquare : setOpponentSquare;
        const isMiss = message.data.value === MoveStatus.Miss;
        const coordinates = message.data.coordinates;

        dispatch(action({ value: isMiss ? GridSquare.Miss : GridSquare.Hit, coordinates }));
      };
    };

    websocket.current = ws;

    // TODO: in general clean-up is needed but not in case of root-level component
    // return () => {
    //   ws.close();
    // };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const fleet = useAppSelector(selectFleet);

  const startGame = () => {
    websocket?.current?.send(
      JSON.stringify({
        event: GameMessageType.CreateGame,
        data: {
          fleet: fleet.map((ship) => toBattleshipCoord(ship)),
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
            <FleetGrid fleet={fleet} />
            <CustomDragLayer />
          </DndProvider>
          <Grid grid={playerGrid} />
        </div>
      </div>

      <div>
        <h3>Opponent's Grid</h3>
        <Grid grid={opponentGrid} onSquareClick={handleSquareClick} />
      </div>
      <button onClick={startGame}>Play!</button>
    </div>
  );
}

export default App;
