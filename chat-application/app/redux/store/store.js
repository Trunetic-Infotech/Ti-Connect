import { configureStore } from "@reduxjs/toolkit";
import authSliceReducer from "../features/auth";
import themeReducer from "../features/themeSlice";
import messagesReducer from "../features/messagesSlice";
import { initSocket } from './../../services/socketService';


export const store = configureStore({
  reducer: {
    auth: authSliceReducer,
    theme: themeReducer,
    socket: initSocket("chat"),
    messages: messagesReducer,
  },
});
