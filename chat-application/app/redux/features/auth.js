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
    logout: (state) => {
      state.user = null;
      state.token =null;
      state.isLoggedIn = false;
      state.onlineUsers = [];
      state.typingStatus = {};
    },
       setOnlineUsers: (state, action) => {
      const { userId, status } = action.payload;
      if (status === "active") {
        if (!state.onlineUsers.includes(userId)) {
          state.onlineUsers.push(userId);
        }
      } else {
        state.onlineUsers = state.onlineUsers.filter((id) => id !== userId);
      }
    },
    setTyping: (state, action) => {
      const { userId, isTyping } = action.payload;
      state.typingUsers[userId] = isTyping;
    },
    clearTyping: (state) => {
      state.typingUsers = {};
    },
  },
});

export const {
  setToken,
  setUser,
  clearTyping,
  logout,
  setOnlineUsers,
  setTyping,
} = authSlice.actions;
export default authSlice.reducer;
