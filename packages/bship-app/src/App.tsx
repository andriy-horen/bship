import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./App.css";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { CustomDragLayer } from "./features/dnd/CustomDragLayer";
import { FleetGrid } from "./features/fleet-grid/FleetGrid";
import {
  selectFleet,
  selectOpponentGrid,
  selectPlayerGrid,
  setOpponentSquare,
} from "./features/game/gameSlice";
import { Grid } from "./features/grid/Grid";

function App() {
  const dispatch = useAppDispatch();
  const playerGrid = useAppSelector(selectPlayerGrid);
  const opponentGrid = useAppSelector(selectOpponentGrid);

  const handleSquareClick = (x: number, y: number) => {
    const value = opponentGrid[x][y];

    dispatch(
      setOpponentSquare({ coordinates: [x, y], value: (value + 1) % 4 })
    );
  };

  const fleet = useAppSelector(selectFleet);

  const startGame = () => {
    console.log("start game click");
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
