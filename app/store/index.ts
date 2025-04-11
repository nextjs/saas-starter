// configureStore: store配置项
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
// combineReducers： 组合reducers目录下的所有reducer模块
import { combineReducers } from "redux";
// 数据持久化
import { persistStore, persistReducer } from "redux-persist";
// defaults to localStorage for web
import localForage from "localforage";

// 导入自己封装好的reducers
import userReducer, { UserState } from "./reducers/userSlice";
import { updateVersion } from "./global/actions";

// 持久化存储配置对象
const persistConfig = {
  key: "interface",
  storage: localForage.createInstance({
    name: "redux",
  }),
  version: 0.3,
  throttle: 1000, // ms
  serialize: false,
  deserialize: false,
  migrate: (state: any) => {
    if (!state || state._persist?.version === persistConfig.version) {
      return Promise.resolve(state);
    }

    // 获取初始状态的所有键
    const initialState = {
      userReducer: {
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
        },
      } as UserState,
    };

    // 深度合并函数
    const deepMerge = (target: any, source: any) => {
      const result = { ...target };
      for (const key in source) {
        if (
          typeof source[key] === "object" &&
          source[key] !== null &&
          !Array.isArray(source[key])
        ) {
          result[key] = deepMerge(target[key] || {}, source[key]);
        } else if (!(key in target)) {
          result[key] = source[key];
        }
      }
      return result;
    };

    // 合并状态，保留已有值，补充缺失的键
    const newState = {
      ...state,
      userReducer: deepMerge(state.userReducer || {}, initialState.userReducer),
      _persist: {
        ...state._persist,
        version: persistConfig.version,
      },
    };

    return Promise.resolve(newState);
  },
};

// 持久化处理后的reducers
const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    // 数据切片
    userReducer,
  })
);
// 将持久化插件和store通过middleware关联起来
const store = configureStore({
  // userReducer 模块名
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: false,
    }),
});

// 可以订阅 store
// store.subscribe(() => console.log(store.getState(), 'userSlice'))

// 持久化的store
const persistor = persistStore(store);

setupListeners(store.dispatch);

store.dispatch(updateVersion());

export { store, persistor };
