// app/redux/features/messagesSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: {}, 
  // structure: { userId: [ {id, sender_id, receiver_id, message, created_at} ] }
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      const msg = action.payload;
      const otherUserId =
        msg.sender_id === msg.myId ? msg.receiver_id : msg.sender_id;

      if (!state.chats[otherUserId]) {
        state.chats[otherUserId] = [];
      }
      state.chats[otherUserId].push(msg);
    },
    setMessagesForUser: (state, action) => {
      const { userId, messages } = action.payload;
      state.chats[userId] = messages;
    },
    clearMessages: (state) => {
      state.chats = {};
    },
  },
});

export const { addMessage, setMessagesForUser, clearMessages } =
  messagesSlice.actions;

export default messagesSlice.reducer;
