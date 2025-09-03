import { io } from "socket.io-client";
import store from "../redux/store/store"; 
import { setOnlineUsers, setTyping } from "../redux/features/auth"; 

const sockets = {};

export const initSocket = (name, url = "http://192.168.1.47:5000", options = {}) => {
  if (sockets[name]) {
    console.warn(`Socket "${name}" already exists`);
    return sockets[name];
  }

  const socket = io(url, options);

  // 🔑 Fix: use "connect", not "connection"
socket.on("connect", () => {
  console.log("connected:", socket.id);
});


  socket.on("disconnect", () => {
    console.log("disconnected:", socket.id);
  });

  if (name === "chat") {
  socket.on("status_update", (data) => {
    store.dispatch(setOnlineUsers(data));
  });

  socket.on("user_typing", (data) => {
    store.dispatch(setTyping({ userId: data.userId, isTyping: true })); 
  });

  socket.on("stop_typing", (data) => {
    store.dispatch(setTyping({ userId: data.userId, isTyping: false }));
  });

  socket.on("receive_message", (msg) => {
    console.log("📩 New message:", msg);
    // you can dispatch to Redux or update UI here
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
