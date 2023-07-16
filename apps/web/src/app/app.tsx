import { Route, Routes } from 'react-router-dom';
import Game from './game/game';
import { Lobby } from './lobby/lobby';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path="/yo" element={<Game />} />
    </Routes>
  );
}
