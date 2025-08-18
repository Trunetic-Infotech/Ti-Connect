// socketService.js
import { io } from "socket.io-client";
import store from "../store/store"; 
import { setOnlineUsers, setTyping } from "../features/auth"; 

const sockets = {}; // store multiple socket instances

export const initSocket = (name, url, options = {}) => {
  if (sockets[name]) {
    console.warn(`Socket "${name}" already exists`);
    return sockets[name];
  }

  const socket = io(url, options);

  // Example global events for all sockets
  socket.on("connect", () => {
    console.log(`[${name}] connected:`, socket.id);
  });

  socket.on("disconnect", () => {
    console.log(`[${name}] disconnected`);
  });

  // Per-namespace example events
  if (name === "chat") {
    socket.on("online_users", (users) => {
      store.dispatch(setOnlineUsers(users)); // Update Redux
    });

    socket.on("typing", (data) => {
      store.dispatch(setTyping({ userId: data.userId, isTyping: true }));
    });

    socket.on("stop_typing", (data) => {
      store.dispatch(setTyping({ userId: data.userId, isTyping: false }));
    });
  }

  sockets[name] = socket;
  return socket;
};

export const getSocket = (name) => sockets[name];

export const closeSocket = (name) => {
  if (sockets[name]) {
    sockets[name].disconnect();
    delete sockets[name];
  }
};

export const closeAllSockets = () => {
  Object.keys(sockets).forEach((name) => {
    sockets[name].disconnect();
    delete sockets[name];
  });
};
