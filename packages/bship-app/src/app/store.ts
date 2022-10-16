import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import gameEventSlice from '../features/game/gameEventSlice';

export const store = configureStore({
  reducer: {
    gameEvent: gameEventSlice,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
