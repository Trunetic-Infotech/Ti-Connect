import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    user: null,
    isLoggedIn: false,
    onlineUsers: [],          // ✅ clearer name
    selectedUser: null,       // ✅ clearer name
    typingUsers: {},
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
      state.token = null;
      state.isLoggedIn = false;
    },

    // ✅ for current user's online users
    setOnlineUsers: (state, action) => {
     // action.payload can be array of users or single update
      if (Array.isArray(action.payload)) {
        const onlineMap = {};
        action.payload.forEach((u) => {
          onlineMap[u.id] = u.status; // status: "active" | "inactive"
        });
        state.onlineUsers = onlineMap;
      } else if (action.payload.userId) {
        state.onlineUsers[action.payload.userId] = action.payload.status;
      }
  
    },


    setTyping: (state, action) => {
      const { userId, isTyping } = action.payload;
      state.typingUsers[userId] = isTyping;
    },
    clearTyping: (state) => {
      state.typingUsers = {};
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
  },
});

export const {
  setToken,
  setUser,
  logout,
  setOnlineUsers,
  setTyping,
  clearTyping,
  setSelectedUser,
} = authSlice.actions;

export default authSlice.reducer;
