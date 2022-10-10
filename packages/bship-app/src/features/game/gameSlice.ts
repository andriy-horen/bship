import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Battleship, Coordinates, Orientation } from 'bship-contracts';
import { RootState } from '../../app/store';
import { expandShip, toBattleshipCoord } from '../../utils';
import { GridSquare } from '../grid-layer/GridLayer';

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

const TEST_FLEET: Battleship[] = [
  { size: 4, orientation: 'v', coordinates: { x: 1, y: 1 } },
  { size: 4, orientation: 'h', coordinates: { x: 3, y: 1 } },

  { size: 1, orientation: 'h', coordinates: { x: 5, y: 8 } },
  { size: 1, orientation: 'h', coordinates: { x: 8, y: 8 } },
];

export interface CurrentGame {
  gameId: string;
  hasStarted: boolean;
}

export interface GameState {
  playerGrid: GridSquare[][];
  opponentGrid: GridSquare[][];
  playerFleet: Battleship[];
  opponentFleet: Battleship[];
  currentGame: CurrentGame;
}

const initialState: GameState = {
  playerGrid: Array(10)
    .fill(0)
    .map(() => Array(10).fill(GridSquare.Empty)),
  opponentGrid: Array(10)
    .fill(0)
    .map(() => Array(10).fill(GridSquare.Empty)),
  playerFleet: TEST_FLEET,
  opponentFleet: [],
  currentGame: {
    gameId: '',
    hasStarted: false,
  },
};

export interface SetSquarePayload {
  squares: { value: GridSquare; coordinates: Coordinates }[];
}

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
// export const incrementAsync = createAsyncThunk(
//   "counter/fetchCount",
//   async (amount: number) => {
//     const response = await fetchCount(amount);
//     // The value we return becomes the `fulfilled` action payload
//     return response.data;
//   }
// );

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setPlayerSquares: (state, { payload }: PayloadAction<SetSquarePayload>) => {
      payload.squares.forEach(({ value, coordinates: { x, y } }) => {
        state.playerGrid[y][x] = value;
      });
    },
    setOpponentSquares: (state, { payload }: PayloadAction<SetSquarePayload>) => {
      payload.squares.forEach(({ value, coordinates: { x, y } }) => {
        state.opponentGrid[y][x] = value;
      });
    },
    setPlayerFleet: (state, action: PayloadAction<Battleship[]>) => {
      state.playerFleet = action.payload;
    },
    setShipPosition(
      state,
      action: PayloadAction<{
        currentPosition: Coordinates;
        newPosition: Coordinates;
      }>
    ) {
      const ship = state.playerFleet.find(
        ({ coordinates }) =>
          coordinates.y === action.payload.currentPosition.y &&
          coordinates.x === action.payload.currentPosition.x
      )!;

      ship.coordinates = action.payload.newPosition;
    },
    setShipOrientation(
      state,
      action: PayloadAction<{
        coordinates: Coordinates;
        orientation: Orientation;
      }>
    ) {
      const ship = state.playerFleet.find(
        ({ coordinates }) =>
          coordinates.y === action.payload.coordinates.y &&
          coordinates.x === action.payload.coordinates.x
      )!;

      ship.orientation = action.payload.orientation;
    },
    setShipHitStatus(
      state,
      action: PayloadAction<{
        coordinates: Coordinates;
      }>
    ) {
      const { x: moveX, y: moveY } = action.payload.coordinates;

      const fleetCoord = state.playerFleet.map((ship) => expandShip(toBattleshipCoord(ship)));
      const shipIndex = fleetCoord.findIndex((sectionCoords) =>
        sectionCoords.some(({ x, y }) => x === moveX && y === moveY)
      );
      const sectionIndex = fleetCoord[shipIndex].findIndex(
        ({ x, y }) => x === moveX && y === moveY
      );

      const sections = state.playerFleet[shipIndex].hitSections ?? [];
      state.playerFleet[shipIndex].hitSections = [...sections, sectionIndex];
    },
    addOpponentShip(
      state,
      action: PayloadAction<{
        battleship: Battleship;
      }>
    ) {
      state.opponentFleet.push(action.payload.battleship);
    },
    updateCurrentGame(
      state,
      action: PayloadAction<{
        gameId: string;
        started: boolean;
      }>
    ) {
      state.currentGame.gameId = action.payload.gameId;
      state.currentGame.hasStarted = action.payload.started;
    },
  },
});

export const {
  setPlayerSquares,
  setOpponentSquares,
  setPlayerFleet,
  setShipPosition,
  setShipOrientation,
  addOpponentShip,
  updateCurrentGame,
  setShipHitStatus,
} = gameSlice.actions;

export const selectPlayerGrid = (state: RootState) => state.game.playerGrid;
export const selectOpponentGrid = (state: RootState) => state.game.opponentGrid;
export const selectPlayerFleet = (state: RootState) => state.game.playerFleet;
export const selectOpponentFleet = (state: RootState) => state.game.opponentFleet;
export const selectCurrentGame = (state: RootState) => state.game.currentGame;

export default gameSlice.reducer;
