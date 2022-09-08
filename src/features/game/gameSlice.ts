import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

export enum GridSquare {
  Empty,
  Pending,
  Miss,
  Hit,
}

export interface Ship {
  size: number;
  orientation: "v" | "h";
  coordinates: [number, number];
}

export interface GameState {
  playerGrid: GridSquare[][];
  opponentGrid: GridSquare[][];
  fleet: Ship[];
}

const initialState: GameState = {
  playerGrid: Array(10)
    .fill(0)
    .map(() => Array(10).fill(GridSquare.Empty)),
  opponentGrid: Array(10)
    .fill(0)
    .map(() => Array(10).fill(GridSquare.Empty)),
  fleet: [
    { size: 1, orientation: "h", coordinates: [0, 0] },
    { size: 1, orientation: "h", coordinates: [0, 2] },
    { size: 1, orientation: "h", coordinates: [0, 4] },
    { size: 1, orientation: "h", coordinates: [0, 6] },
    { size: 2, orientation: "h", coordinates: [2, 0] },
    { size: 2, orientation: "h", coordinates: [2, 3] },
    { size: 2, orientation: "h", coordinates: [2, 6] },
    { size: 3, orientation: "h", coordinates: [4, 0] },
    { size: 3, orientation: "v", coordinates: [4, 4] },
    { size: 4, orientation: "v", coordinates: [6, 0] },
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
  name: "game",
  initialState,
  reducers: {
    setPlayerSquare: (state, { payload }: PayloadAction<SetSquarePayload>) => {
      const [x, y] = payload.coordinates;
      state.playerGrid[x][y] = payload.value;
    },
    setOpponentSquare: (
      state,
      { payload }: PayloadAction<SetSquarePayload>
    ) => {
      const [x, y] = payload.coordinates;
      state.opponentGrid[x][y] = payload.value;
    },
    setPlayerFleet: (state, action: PayloadAction<Ship[]>) => {
      state.fleet = action.payload;
    },
  },
});

export const { setPlayerSquare, setOpponentSquare, setPlayerFleet } =
  gameSlice.actions;

export const selectPlayerGrid = (state: RootState) => state.game.playerGrid;
export const selectOpponentGrid = (state: RootState) => state.game.opponentGrid;
export const selectFleet = (state: RootState) => state.game.fleet;

export default gameSlice.reducer;
