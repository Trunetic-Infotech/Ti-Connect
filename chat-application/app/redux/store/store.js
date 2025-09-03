import { configureStore } from "@reduxjs/toolkit";
import authSliceReducer from "../features/auth";
import themeReducer from "../features/themeSlice";
import { initSocket } from "@/app/services/socketService";

export const store = configureStore({
  reducer: {
    auth: authSliceReducer,
    theme: themeReducer,
    socket: initSocket("chat"),
  },
});
