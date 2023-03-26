import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import gameEventSlice from '../features/game/gameEventSlice';
import userSlice from '../features/user/userSlice';

export const store = configureStore({
  reducer: {
    gameEvent: gameEventSlice,
    user: userSlice,
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
