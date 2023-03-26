import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface UserState {
  userId: string;
  username: string;
  geolocation: string | undefined;
  preferredFlag: string | undefined;
}

const initialState: UserState = {
  userId: '',
  username: '',
  geolocation: undefined,
  preferredFlag: undefined,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    reducer: () => {},
  },
});

export const selectUserIsEmpty = (state: RootState) =>
  state.user.userId === '' && state.user.username === '';

export default userSlice.reducer;
