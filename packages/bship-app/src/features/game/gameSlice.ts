import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Battleship } from 'bship-contracts';
import { RootState } from '../../app/store';

export enum GridSquare {
  Empty,
  Miss,
  Hit,
}

export interface GameState {
  playerGrid: GridSquare[][];
  opponentGrid: GridSquare[][];
  fleet: Battleship[];
}

const initialState: GameState = {
  playerGrid: Array(10)
    .fill(0)
    .map(() => Array(10).fill(GridSquare.Empty)),
  opponentGrid: Array(10)
    .fill(0)
    .map(() => Array(10).fill(GridSquare.Empty)),
  fleet: [
    { size: 1, orientation: 'h', position: [0, 0] },
    { size: 1, orientation: 'h', position: [0, 2] },
    { size: 1, orientation: 'h', position: [0, 4] },
    { size: 1, orientation: 'h', position: [0, 6] },
    { size: 2, orientation: 'h', position: [2, 0] },
    { size: 2, orientation: 'h', position: [2, 3] },
    { size: 2, orientation: 'h', position: [2, 6] },
    { size: 3, orientation: 'h', position: [4, 0] },
    { size: 3, orientation: 'v', position: [4, 4] },
    { size: 4, orientation: 'v', position: [6, 0] },
  ],
};

export interface SetSquarePayload {
  value: GridSquare;
  coordinates: [number, number];
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
      const [x, y] = payload.coordinates;
      state.playerGrid[x][y] = payload.value;
    },
    setOpponentSquare: (state, { payload }: PayloadAction<SetSquarePayload>) => {
      const [x, y] = payload.coordinates;
      state.opponentGrid[x][y] = payload.value;
    },
    setPlayerFleet: (state, action: PayloadAction<Battleship[]>) => {
      state.fleet = action.payload;
    },
    setShipPosition(
      state,
      action: PayloadAction<{
        currentPosition: [number, number];
        newPosition: [number, number];
      }>
    ) {
      const ship = state.fleet.find(
        ({ position }) =>
          position[0] === action.payload.currentPosition[0] &&
          position[1] === action.payload.currentPosition[1]
      )!;

      ship.position = action.payload.newPosition;
    },
    setShipOrientation(
      state,
      action: PayloadAction<{
        position: [number, number];
        orientation: 'v' | 'h';
      }>
    ) {
      const ship = state.fleet.find(
        ({ position }) =>
          position[0] === action.payload.position[0] && position[1] === action.payload.position[1]
      )!;

      ship.orientation = action.payload.orientation;
    },
  },
});

export const {
  setPlayerSquare,
  setOpponentSquare,
  setPlayerFleet,
  setShipPosition,
  setShipOrientation,
} = gameSlice.actions;

export const selectPlayerGrid = (state: RootState) => state.game.playerGrid;
export const selectOpponentGrid = (state: RootState) => state.game.opponentGrid;
export const selectFleet = (state: RootState) => state.game.fleet;

export default gameSlice.reducer;
