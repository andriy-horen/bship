import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Battleship, Coordinates, Orientation } from 'bship-contracts';
import { RootState } from '../../app/store';
import { GridSquare } from '../grid-layer/GridLayer';

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
  playerFleet: [
    { size: 1, orientation: 'h', coordinates: { x: 0, y: 0 } },
    { size: 1, orientation: 'h', coordinates: { x: 2, y: 0 } },
    { size: 1, orientation: 'h', coordinates: { x: 4, y: 0 } },
    { size: 1, orientation: 'h', coordinates: { x: 6, y: 0 } },
    { size: 2, orientation: 'h', coordinates: { x: 0, y: 2 } },
    { size: 2, orientation: 'h', coordinates: { x: 3, y: 2 } },
    { size: 2, orientation: 'h', coordinates: { x: 6, y: 2 } },
    { size: 3, orientation: 'h', coordinates: { x: 0, y: 4 } },
    { size: 3, orientation: 'v', coordinates: { x: 4, y: 4 } },
    { size: 4, orientation: 'v', coordinates: { x: 0, y: 6 } },
  ],
  opponentFleet: [],
};

export interface SetSquarePayload {
  value: GridSquare;
  coordinates: Coordinates;
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
    setPlayerSquare: (state, { payload }: PayloadAction<SetSquarePayload>) => {
      const { x, y } = payload.coordinates;
      state.playerGrid[y][x] = payload.value;
    },
    setOpponentSquare: (state, { payload }: PayloadAction<SetSquarePayload>) => {
      const { x, y } = payload.coordinates;
      state.opponentGrid[y][x] = payload.value;
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
  setPlayerSquare,
  setOpponentSquare,
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
