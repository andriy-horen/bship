import "./App.css";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { Counter } from "./features/counter/Counter";
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

  return (
    <div className="App">
      <Counter />
      <div>
        <h3>Player's Grid</h3>
        <div className="player-grid">
          <FleetGrid fleet={fleet} />
          <Grid grid={playerGrid} />
        </div>
      </div>

      <div>
        <h3>Opponent's Grid</h3>
        <Grid grid={opponentGrid} onSquareClick={handleSquareClick} />
      </div>
    </div>
  );
}

export default App;
