import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserInfo, Config, From } from "./typs";
import { UserInfoData } from "@/app/types/types";

// 定义用户状态接口
export interface UserState {
  theme: string;
  isLoggedIn: boolean;
  userInfo: UserInfo;
  config: Config;
  from: From;
  twitter_full_profile: any;
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
    is_x_authorizationed: false,
    screen_name: "",
    profile_image_url: "",
    description: "",
    token: "",
    details: {
      agent: {
        created: 0,
        total: 0,
      },
      current_member: {
        id: 0,
        name: "",
      },
      email: "",
      user_name: "",
    },
  },
  config: {
    region: [],
    language: [],
    character: [],
    topics: [],
    ability: [],
    price: [],
    kols: [],
    limit: {
      post: 0,
      repost: 0,
      likes: 0,
      quote: 0,
      reply: 0,
      comment: 0,
      agent: 0,
    },
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
  twitter_full_profile: {},
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
          is_x_authorizationed: false,
          screen_name: "",
          profile_image_url: "",
          description: "",
          token: "",
          details: {
            agent: {
              created: 0,
              total: 0,
            },
            current_member: {
              id: 0,
              name: "",
            },
            email: "",
            user_name: "",
          },
        };
      }
    },
    updateDetails: (state, action: PayloadAction<UserInfoData>) => {
      state.userInfo.details = action.payload;
    },
    updateUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
    },
    updateConfig: (
      state,
      action: PayloadAction<{
        key: keyof Config;
        value: any[] | number | string | { post: number; repost: number; likes: number; quote: number; reply: number; comment: number; agent: number; };
      }>
    ) => {
      const { key, value } = action.payload;
      if (key === "currentStep") {
        state.config[key] = value as number;
      } else if (key === "limit") {
        state.config[key] = value as { post: number; repost: number; likes: number; quote: number; reply: number; comment: number; agent: number; };
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
    clearFrom: (state) => {
      state.from = {
        step1: {},
        step2: {},
        step3: {},
        step4: {},
        step5: {},
        step6: {},
      };
    },
    updateTwitterFullProfile: (state, action: PayloadAction<any>) => {
      state.twitter_full_profile = action.payload;
    },
  },
});

export const {
  updateTheme,
  updateIsLoggedIn,
  updateUserInfo,
  updateConfig,
  updateFrom,
  clearFrom,
  updateTwitterFullProfile,
  updateDetails,
} = userSlice.actions;

export default userSlice.reducer;
