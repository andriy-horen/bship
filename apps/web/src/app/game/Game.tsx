import { Point } from '@bship/contracts';
import { noop } from 'lodash-es';
import { shallow } from 'zustand/shallow';
import { EditGrid } from '../grids/edit-grid/EditGrid';
import { PlayGrid } from '../grids/play-grid/PlayGrid';
import useGameStore, {
  GameStatus,
  selectOpponentFleet,
  selectOpponentGrid,
  selectPlayerGrid,
} from '../store/gameStore';
import { UserVersus } from '../user-versus/UserVersus';
import './Game.css';

function App() {
  const [gameStatus, playerFleet, gameUpdates] = useGameStore(
    (state) => [state.status, state.playerFleet, state.gameUpdates],
    shallow,
  );

  const playerGrid = selectPlayerGrid(gameUpdates);
  const opponentGrid = selectOpponentGrid(gameUpdates);
  const opponentFleet = selectOpponentFleet(gameUpdates);

  // TODO: uncomment when ws is passed into Game component
  const handleSquareClick = (coordinates: Point) => {
    // sendJsonMessage({
    //   event: GameMessageType.GameEvent,
    //   data: {
    //     coordinates,
    //   },
    // } as any);
  };

  // // TODO: usernameModal string is a magic string and used also as mapping in index.tsx, needs to be extracted & refactored
  // const openModal = () =>
  //   modals.openContextModal({
  //     modal: 'usernameModal',
  //     title: 'Player details',
  //     innerProps: {
  //       onSubmit: () => {
  //         console.log('submit!');
  //       },
  //     },
  //   });

  function getPlayerGrid() {
    if (gameStatus === GameStatus.None) {
      return (
        <div className="player-grid">
          <EditGrid fleet={playerFleet} grid={playerGrid}></EditGrid>
        </div>
      );
    }

    return <PlayGrid fleet={playerFleet} grid={playerGrid} onSquareClick={noop} />;
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
          <PlayGrid fleet={opponentFleet} grid={opponentGrid} onSquareClick={handleSquareClick} />
        </div>
      </div>
    </>
  );
}

export default App;
