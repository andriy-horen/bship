import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Battleship, insideBounds, MarkPayload, MoveStatus, Point } from 'bship-contracts';
import { AppThunk, RootState } from '../../app/store';
import { getBoxCoordinates, getCornerCoordinates, toBattleshipModel, toRect } from '../../utils';

export enum GameStatus {
  None,
  WaitingForOpponent,
  GameStarted,
}

export interface GameEventState {
  gameId: string;
  moves: MarkPayload[];
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
  moves: [],
  status: GameStatus.None,
  playerFleet: NORMAL_FLEET,
};

export const gameEventSlice = createSlice({
  name: 'gameEvent',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    addMove: (state, { payload }: PayloadAction<MarkPayload>) => {
      state.moves.push(payload);
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
      state.moves = [];
      state.status = GameStatus.None;
      state.playerFleet.forEach((ship) => {
        ship.hitSections = [];
      });
    },
    // TODO: drop this hacky implementation
    hitShip: (state, { payload: coord }: PayloadAction<Point>) => {
      const shipIndex = state.playerFleet
        .map((ship) => toRect(ship))
        .findIndex((ship) => insideBounds(coord, ship));

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

function convertMoveStatus(status: MoveStatus): GridSquare {
  switch (status) {
    case MoveStatus.Miss:
      return GridSquare.Miss;
    case MoveStatus.Hit:
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

export const gridSelector = (moves: MarkPayload[]) => {
  return moves.reduce((grid, { coordinates, value, target }) => {
    grid[coordinates.y][coordinates.x] = convertMoveStatus(value);

    if (value === MoveStatus.Hit) {
      getCornerCoordinates(coordinates).forEach(({ x, y }) => {
        grid[y][x] = GridSquare.Miss;
      });
    }
    if (target) {
      getBoxCoordinates(target).forEach(({ x, y }) => {
        grid[y][x] = GridSquare.Miss;
      });
    }

    return grid;
  }, getEmtpyGrid());
};

export const selectPlayerGrid = ({ gameEvent: { moves } }: RootState) =>
  gridSelector(moves.filter((move) => move.self));
export const selectOpponentGrid = ({ gameEvent: { moves } }: RootState) =>
  gridSelector(moves.filter((move) => !move.self));

export const selectPlayerFleet = (state: RootState) => state.gameEvent.playerFleet;
export const selectOpponentFleet = (state: RootState) => {
  return state.gameEvent.moves
    .filter((move) => !move.self && !!move.target)
    .map((move) => toBattleshipModel(move.target!, true));
};

export const selectGameStatus = (state: RootState) => state.gameEvent.status;

export const addMoveUpdateFleet =
  (move: MarkPayload): AppThunk =>
  (dispatch) => {
    const { addMove, hitShip } = gameEventSlice.actions;

    dispatch(addMove(move));
    if (move.self && move.value === MoveStatus.Hit) {
      dispatch(hitShip(move.coordinates));
    }
  };

export default gameEventSlice.reducer;
