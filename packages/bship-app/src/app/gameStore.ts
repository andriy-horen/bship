import { Battleship, contains, GameUpdatePayload, Point, UpdateStatus } from 'bship-contracts';
import { create } from 'zustand';
import { getBoxCoordinates, getCornerCoordinates, toBattleshipModel, toRect } from '../utils';

export type StoreAction<T> = (payload: T) => void;

export enum GameStatus {
  None,
  WaitingForOpponent,
  GameStarted,
  GameOver,
}

export type GameState = {
  gameId: string;
  gameUpdates: GameUpdatePayload[];
  status: GameStatus;
  playerFleet: Battleship[];
};

export type GameAction = {
  addUpdate: StoreAction<GameUpdatePayload>;
  waitingForOpponent: StoreAction<void>;
  gameStarted: StoreAction<{ gameId: string }>;
  gameReset: StoreAction<void>;
  hitShip: StoreAction<Point>;
  updateShipPosition: StoreAction<{ currentCoord: Point; newCoord: Point }>;
  toggleShipOrientation: StoreAction<Point>;
};

const DEFAULT_FLEET: Battleship[] = [
  { size: 1, orientation: 'h', coordinates: { x: 5, y: 8 } },
  { size: 1, orientation: 'h', coordinates: { x: 8, y: 5 } },
  { size: 1, orientation: 'h', coordinates: { x: 5, y: 5 } },
  { size: 1, orientation: 'h', coordinates: { x: 8, y: 8 } },
  { size: 2, orientation: 'h', coordinates: { x: 0, y: 0 } },
  { size: 2, orientation: 'h', coordinates: { x: 3, y: 0 } },
  { size: 2, orientation: 'h', coordinates: { x: 6, y: 0 } },
  { size: 3, orientation: 'h', coordinates: { x: 0, y: 2 } },
  { size: 3, orientation: 'h', coordinates: { x: 4, y: 2 } },
  { size: 4, orientation: 'v', coordinates: { x: 1, y: 5 } },
];

const initialState: GameState = {
  gameId: '',
  gameUpdates: [],
  status: GameStatus.None,
  playerFleet: DEFAULT_FLEET,
};

// TODO : add missing logic for ship hit / sunk

// export const addUpdateThunk =
//   (update: GameUpdatePayload): AppThunk =>
//   (dispatch) => {
//     const { addUpdate, hitShip } = gameEventSlice.actions;

//     dispatch(addUpdate(update));
//     if (update.self && update.status === UpdateStatus.Hit) {
//       dispatch(hitShip(update.coord));
//     }
//   };

const useGameStore = create<GameState & GameAction>((set) => ({
  ...initialState,
  addUpdate: (payload: GameUpdatePayload) =>
    set((state) => ({
      gameUpdates: [...state.gameUpdates, payload],
      status: payload.won != null ? GameStatus.GameOver : state.status,
    })),
  waitingForOpponent: () =>
    set({
      status: GameStatus.WaitingForOpponent,
    }),
  gameStarted: (payload) =>
    set({
      gameId: payload.gameId,
      status: GameStatus.GameStarted,
    }),
  gameReset: () =>
    set((state) => ({
      gameId: '',
      gameUpdates: [],
      status: GameStatus.None,
      playerFleet: state.playerFleet.map((ship) => ({ ...ship, hitSection: [] })),
    })),
  // TODO: drop this hacky implementation
  hitShip: (targetCoord) =>
    set((state) => ({
      playerFleet: state.playerFleet.map((ship) => {
        if (contains(targetCoord, toRect(ship))) {
          const sectionIndex = Math.max.apply(null, [
            targetCoord.x - ship.coordinates.x,
            targetCoord.y - ship.coordinates.y,
          ]);

          const sections = ship.hitSections ?? [];
          return { ...ship, hitSections: [...sections, sectionIndex] };
        }

        return ship;
      }),
    })),
  updateShipPosition: ({ currentCoord, newCoord }) =>
    set((state) => ({
      playerFleet: state.playerFleet.map((ship) => {
        if (ship.coordinates.x === currentCoord.x && ship.coordinates.y === currentCoord.y) {
          return { ...ship, coordinates: newCoord };
        }

        return ship;
      }),
    })),
  toggleShipOrientation: (coord) =>
    set((state) => ({
      playerFleet: state.playerFleet.map((ship) => {
        if (ship.coordinates.x === coord.x && ship.coordinates.y === coord.y) {
          return { ...ship, orientation: ship.orientation === 'v' ? 'h' : 'v' };
        }

        return ship;
      }),
    })),
}));

export default useGameStore;

// SELECTORS

export enum GridSquare {
  Empty,
  Miss,
  Hit,
}

function getEmtpyGrid(): GridSquare[][] {
  const GRID_SIZE = 10;
  return Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(GridSquare.Empty));
}

function convertUpdateStatus(status: UpdateStatus): GridSquare {
  switch (status) {
    case UpdateStatus.Miss:
      return GridSquare.Miss;
    case UpdateStatus.Hit:
      return GridSquare.Hit;
    default:
      return GridSquare.Empty;
  }
}

export const gridSelector = (updates: GameUpdatePayload[]) => {
  return updates.reduce((grid, { coord, status, sunk }) => {
    grid[coord.y][coord.x] = convertUpdateStatus(status);

    if (status === UpdateStatus.Hit) {
      getCornerCoordinates(coord).forEach(({ x, y }) => {
        grid[y][x] = GridSquare.Miss;
      });
    }
    if (sunk) {
      getBoxCoordinates(sunk).forEach(({ x, y }) => {
        grid[y][x] = GridSquare.Miss;
      });
    }

    return grid;
  }, getEmtpyGrid());
};

export const selectPlayerGrid = (updates: GameUpdatePayload[]) =>
  gridSelector(updates.filter((update) => update.self));

export const selectOpponentGrid = (updates: GameUpdatePayload[]) =>
  gridSelector(updates.filter((update) => !update.self));

export const selectOpponentFleet = (updates: GameUpdatePayload[]) => {
  return updates
    .filter((update) => !update.self && !!update.sunk)
    .map((update) => toBattleshipModel(update.sunk!, true));
};
