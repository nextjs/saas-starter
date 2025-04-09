import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserInfo, Config, From } from "./typs";

// 定义用户状态接口
export interface UserState {
  theme: string;
  isLoggedIn: boolean;
  userInfo: UserInfo;
  config: Config;
  from: From;
}

const initialState: UserState = {
  theme: "dark",
  isLoggedIn: false,
  userInfo: {
    id: 0,
    username: "",
    email: "",
    identity: "",
    member_id: 0,
    member_name: "",
    token: "",
  },
  config: {
    region: [],
    language: [],
    character: [],
    topics: [],
    currentStep: 1,
  },
  from: {
    step1: {},
    step2: {},
    step3: {},
    step4: {},
    step5: {},
    step6: {},
  },
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
      if (action.payload) {
        state.isLoggedIn = action.payload;
      } else {
        state.isLoggedIn = false;
        state.userInfo = {
          id: 0,
          username: "",
          email: "",
          identity: "",
          member_id: 0,
          member_name: "",
          token: "",
        };
      }
    },
    updateUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
    },
    updateConfig: (
      state,
      action: PayloadAction<{
        key: keyof Config;
        value: any[] | number | string;
      }>
    ) => {
      const { key, value } = action.payload;
      if (key === "currentStep") {
        state.config[key] = value as number;
      } else {
        state.config[key] = value as any[];
      }
    },
    updateFrom: (
      state,
      action: PayloadAction<{ key: keyof From; value: {} }>
    ) => {
      const { key, value } = action.payload;
      state.from[key] = value;
    },
  },
});

export const {
  updateTheme,
  updateIsLoggedIn,
  updateUserInfo,
  updateConfig,
  updateFrom,
} = userSlice.actions;

export default userSlice.reducer;
