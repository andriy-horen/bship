import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Battleship, Coordinates, Orientation } from 'bship-contracts';
import { RootState } from '../../app/store';
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

export interface GameState {
  playerGrid: GridSquare[][];
  opponentGrid: GridSquare[][];
  playerFleet: Battleship[];
  opponentFleet: Battleship[];
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
    addOpponentShip(
      state,
      action: PayloadAction<{
        battleship: Battleship;
      }>
    ) {
      state.opponentFleet.push(action.payload.battleship);
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
} = gameSlice.actions;

export const selectPlayerGrid = (state: RootState) => state.game.playerGrid;
export const selectOpponentGrid = (state: RootState) => state.game.opponentGrid;
export const selectPlayerFleet = (state: RootState) => state.game.playerFleet;
export const selectOpponentFleet = (state: RootState) => state.game.opponentFleet;

export default gameSlice.reducer;
