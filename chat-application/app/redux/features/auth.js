// import { createSlice } from '@reduxjs/toolkit'

// const authSlice = createSlice({
//   name: 'auth',
//   initialState: {
//     user: null,
//     isLoggedIn: false,
//   },
//   reducers: {
//     login: (state, action) => {
//       state.user = action.payload;
//       state.isLoggedIn = true;
//     },
//     logout: (state) => {
//       state.user = null;
//       state.isLoggedIn = false;
//     },
//   },
// });

// export const { login, logout } = authSlice.actions;
// export default authSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    user: null,
    isLoggedIn: false,
    onlineUsers: [],
    typingStatus: {},
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = true;
    },
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.onlineUsers = [];
      state.typingStatus = {};
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setTyping: (state, action) => {
      const { userId, isTyping } = action.payload;
      state.typingStatus[userId] = isTyping;
    },
  },
});

export const {
  setToken,
  setUser,
  clearAuth,
  logout,
  setOnlineUsers,
  setTyping,
} = authSlice.actions;
export default authSlice.reducer;
