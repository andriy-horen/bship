import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './app-layout/AppLayout';
import Game from './game/Game';
import { Lobby } from './lobby/Lobby';

export function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/yo" element={<Game />} />
      </Routes>
    </AppLayout>
  );
}
