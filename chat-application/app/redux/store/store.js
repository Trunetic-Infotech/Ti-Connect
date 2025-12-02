import { configureStore } from "@reduxjs/toolkit";
import authSliceReducer from "../features/auth";
import themeReducer from "../features/themeSlice";
import messagesReducer from "../features/messagesSlice";
import socketReducer from "../features/socketSlice";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

const themePersistConfig = {
  key: "theme",
  storage: AsyncStorage,
  whitelist: ["darkMode"], // only save darkMode
};

const persistedThemeReducer = persistReducer(themePersistConfig, themeReducer);

const store = configureStore({
  reducer: {
    auth: authSliceReducer,
    theme: persistedThemeReducer,
    socket: socketReducer,
    messages: messagesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE", "persist/REGISTER"],
      },
    }),
});

export const persistor = persistStore(store);
export default store;