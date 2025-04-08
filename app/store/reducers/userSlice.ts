import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 定义用户状态接口
interface UserState {
  theme: string;
  isLoggedIn: boolean;
}

const initialState: UserState = {
  theme: "dark",
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // 使用 PayloadAction 类型声明 `action.payload` 的内容
    updateTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
    },
    updateIsLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
    },
  },
});

export const {
  updateTheme,
  updateIsLoggedIn,
} = userSlice.actions;

export default userSlice.reducer;
