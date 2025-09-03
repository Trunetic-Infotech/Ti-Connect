import { configureStore } from "@reduxjs/toolkit";
import authSliceReducer from "../features/auth";
import themeReducer from "../features/themeSlice";

export const store = configureStore({
  reducer: {
    auth: authSliceReducer,
    theme: themeReducer,
    
  },
});
