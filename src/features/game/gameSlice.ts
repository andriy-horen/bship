import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

export enum GridSquare {
  Empty,
  Hit,
  Miss,
}

export enum ShipOrientation {
  Vertical,
  Horizontal,
}

export interface Ship {
  size: number;
  orientation: ShipOrientation;
  coordinates: [number, number];
}

export interface GameState {
  playerGrid: GridSquare[][];
  opponentGrid: GridSquare[][];
  ships: Ship[];
}

const initialState: GameState = {
  playerGrid: Array(10)
    .fill(0)
    .map(() => Array(10).fill(GridSquare.Empty)),
  opponentGrid: Array(10)
    .fill(0)
    .map(() => Array(10).fill(GridSquare.Empty)),
  ships: [],
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
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setPlayerSquare: (state, action: PayloadAction<SetSquarePayload>) => {
      const [x, y] = action.payload.coordinates;

      state.playerGrid[x][y] = action.payload.value;
    },
    setOpponentSquare: (state, action: PayloadAction<SetSquarePayload>) => {
      const [x, y] = action.payload.coordinates;

      state.opponentGrid[x][y] = action.payload.value;
    },
  },
});

export const { setPlayerSquare, setOpponentSquare } = gameSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectPlayerGrid = (state: RootState) => state.game.playerGrid;
export const selectOpponentGrid = (state: RootState) => state.game.opponentGrid;

export default gameSlice.reducer;
