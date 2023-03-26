import { createSlice } from '@reduxjs/toolkit';

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
