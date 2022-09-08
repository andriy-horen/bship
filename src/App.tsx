import "./App.css";
import { Counter } from "./features/counter/Counter";
import { Grid } from "./features/grid/Grid";

function App() {
  return (
    <div className="App">
      <Counter />
      <Grid />
    </div>
  );
}

export default App;
