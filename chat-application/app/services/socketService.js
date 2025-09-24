import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (userId) => {
  socket = io("http://192.168.1.58:5000", {
    query: {
      id: userId,
    },
  });

    socket.on("connect", () => {
    console.log("📌 Connected with socket ID:", socket.id);

    // Mark user online on the backend
    socket.emit("user_online", userId);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners(); // removes all listeners
    socket.disconnect();
    socket = null;
  }
};
