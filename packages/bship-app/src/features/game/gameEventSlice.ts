import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Battleship, contains, GameUpdatePayload, Point, UpdateStatus } from 'bship-contracts';
import { AppThunk, RootState } from '../../app/store';
import { getBoxCoordinates, getCornerCoordinates, toBattleshipModel, toRect } from '../../utils';

export enum GameStatus {
  None,
  WaitingForOpponent,
  GameStarted,
  GameOver,
}

export interface GameEventState {
  gameId: string;
  gameUpdates: GameUpdatePayload[];
  status: GameStatus;
  playerFleet: Battleship[];
}

const NORMAL_FLEET: Battleship[] = [
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

const initialState: GameEventState = {
  gameId: '',
  gameUpdates: [],
  status: GameStatus.None,
  playerFleet: NORMAL_FLEET,
};

export const gameEventSlice = createSlice({
  name: 'gameEvent',
  initialState,
  reducers: {
    addUpdate: (state, { payload }: PayloadAction<GameUpdatePayload>) => {
      state.gameUpdates.push(payload);
      if (payload.won != null) {
        state.status = GameStatus.GameOver;
      }
    },
    waitingForOpponent: (state) => {
      state.status = GameStatus.WaitingForOpponent;
    },
    gameStarted: (state, { payload }: PayloadAction<{ gameId: string }>) => {
      state.gameId = payload.gameId;
      state.status = GameStatus.GameStarted;
    },
    gameReset: (state) => {
      state.gameId = '';
      state.gameUpdates = [];
      state.status = GameStatus.None;
      state.playerFleet.forEach((ship) => {
        ship.hitSections = [];
      });
    },
    // TODO: drop this hacky implementation
    hitShip: (state, { payload: coord }: PayloadAction<Point>) => {
      const shipIndex = state.playerFleet
        .map((ship) => toRect(ship))
        .findIndex((ship) => contains(coord, ship));

      const ship = state.playerFleet[shipIndex];
      const sectionIndex = Math.max.apply(null, [
        coord.x - ship.coordinates.x,
        coord.y - ship.coordinates.y,
      ]);

      const sections = state.playerFleet[shipIndex].hitSections ?? [];
      state.playerFleet[shipIndex].hitSections = [...sections, sectionIndex];
    },
    updateShipPosition: (
      state,
      {
        payload: { currentCoord, newCoord },
      }: PayloadAction<{ currentCoord: Point; newCoord: Point }>
    ) => {
      const ship = state.playerFleet.find(
        ({ coordinates: { x, y } }) => x === currentCoord.x && y === currentCoord.y
      );

      if (!ship) return;
      ship.coordinates = newCoord;
    },
    toggleShipOrientation: (state, { payload }: PayloadAction<Point>) => {
      const ship = state.playerFleet.find(
        ({ coordinates: { x, y } }) => x === payload.x && y === payload.y
      );

      if (!ship) return;
      ship.orientation = ship.orientation === 'v' ? 'h' : 'v';
    },
  },
});

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

export const {
  waitingForOpponent,
  gameStarted,
  gameReset,
  updateShipPosition,
  toggleShipOrientation,
} = gameEventSlice.actions;

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

export const selectPlayerGrid = ({ gameEvent: { gameUpdates: updates } }: RootState) =>
  gridSelector(updates.filter((update) => update.self));
export const selectOpponentGrid = ({ gameEvent: { gameUpdates: updates } }: RootState) =>
  gridSelector(updates.filter((update) => !update.self));

export const selectPlayerFleet = (state: RootState) => state.gameEvent.playerFleet;
export const selectOpponentFleet = (state: RootState) => {
  return state.gameEvent.gameUpdates
    .filter((update) => !update.self && !!update.sunk)
    .map((update) => toBattleshipModel(update.sunk!, true));
};

export const selectGameStatus = (state: RootState) => state.gameEvent.status;

export const addUpdateThunk =
  (update: GameUpdatePayload): AppThunk =>
  (dispatch) => {
    const { addUpdate, hitShip } = gameEventSlice.actions;

    dispatch(addUpdate(update));
    if (update.self && update.status === UpdateStatus.Hit) {
      dispatch(hitShip(update.coord));
    }
  };

export default gameEventSlice.reducer;
