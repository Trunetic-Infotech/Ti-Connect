// import { configureStore } from "@reduxjs/toolkit";
// import authSliceReducer from "../features/auth";
// import themeReducer from "../features/themeSlice";
// import messagesReducer from "../features/messagesSlice";
// import { initSocket } from './../../services/socketService';


// export const store = configureStore({
//   reducer: {
//     auth: authSliceReducer,
//     theme: themeReducer,
//     socket: initSocket("chat"),
//     messages: messagesReducer,
//   },
// });

import { configureStore } from "@reduxjs/toolkit";
import authSliceReducer from "../features/auth";
import themeReducer from "../features/themeSlice";
import messagesReducer from "../features/messagesSlice";
import socketReducer from "../features/socketSlice"; // ✅ import your socket slice

export const store = configureStore({
  reducer: {
    auth: authSliceReducer,
    theme: themeReducer,
    socket: socketReducer,   // ✅ this is the reducer
    messages: messagesReducer,
  },
});
