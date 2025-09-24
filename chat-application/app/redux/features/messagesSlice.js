// app/redux/features/messagesSlice.js
import { createSlice } from "@reduxjs/toolkit";

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    messages: [],
    user: null,
    selectedUser: null,
    isUserLoading: false,
    isMessagesLoading: false,
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    pushNewMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
});

export const { setSelectedUser, pushNewMessage } = messagesSlice.actions;

export default messagesSlice.reducer;
