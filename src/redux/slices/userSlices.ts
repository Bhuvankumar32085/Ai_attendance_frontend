import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface IUser {
  user_id: number;
  username: string;
  name: string;
  role: "student" | "teacher" | "admin";
  created_at?: string;
}

interface UserState {
  loggedUser: IUser | null;
  isLoading: boolean;
}

const initialState: UserState = {
  loggedUser: null,
  isLoading: true,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLoggedUser(state, action: PayloadAction<IUser | null>) {
      state.loggedUser = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setLoggedUser ,setLoading} = userSlice.actions;
export default userSlice.reducer;
