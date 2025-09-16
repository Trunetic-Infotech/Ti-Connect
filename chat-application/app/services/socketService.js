import { io } from "socket.io-client";
import store from "../redux/store/store"; 
import { setOnlineUsers, setTyping } from "../redux/features/auth"; 

const sockets = {};
let appStore;

export const setStore = (reduxStore) => {
  appStore = reduxStore;
};

export const initSocket = (name, url = "http://192.168.1.49:5000", options = {}) => {
  if (sockets[name]) {
    console.warn(`Socket "${name}" already exists`);
    return sockets[name];
  }

  const socket = io(url, options);

  // 🔑 Fix: use "connect", not "connection"
socket.on("connect", () => {
  console.log("connected:", socket.id);

      const state = store.getState();
    const phone_number = state.auth?.user?.phone_number;

    if (phone_number) {
      socket.emit("user_online", phone_number); // notify backend
    }

});

  // 🔄 Handle reconnect
  socket.on("reconnect", () => {
    console.log("🔄 Reconnected:", socket.id);

    const state = store.getState();
    const phone_number = state.auth?.user?.phone_number;

    if (phone_number) {
      socket.emit("user_online", phone_number); // re-announce online
    }
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
      store.dispatch(addMessage(msg));
    });

    //  Notifications
    socket.on("receive_notification", (notification) => {
      console.log("🔔 Notification:", notification);
      // You can dispatch to Redux or show a toast
    });
}

socket.on("disconnect", () => {
  console.log("❌ Disconnected:", socket.id);
  const { user } = store.getState().auth || {};
  if (user?.id) {
    socket.emit("user_offline", user.id);
  }
});

  sockets[name] = socket;
  return socket;
};

export const getSocket = (name) => sockets[name];

// export const closeSocket = (name) => {
//   if (sockets[name]) {
//     sockets[name].disconnect();
//     delete sockets[name];
//   }
// };

// export const closeAllSockets = () => {
//   Object.keys(sockets).forEach((name) => {
//     sockets[name].disconnect();
//     delete sockets[name];
//   });
// };







// // socketService.js
// import { io } from "socket.io-client";
// import store from "../redux/store/store";
// import { setOnlineUsers, setTyping, addMessage } from "../redux/features/auth";

// const sockets = {};

// /**
//  * 🔹 Initialize a socket connection
//  */
// export const initSocket = (name, url = "http://192.168.1.49:5000", options = {}) => {
//   if (sockets[name]) {
//     console.warn(`⚠️ Socket "${name}" already exists`);
//     return sockets[name];
//   }

  
//   const socket = io(url, options);

//   // ✅ On connect
//   socket.on("connect", () => {
//     console.log("✅ Connected:", socket.id);

//     const state = store.getState();
//     const phone_number = state.auth?.user?.phone_number;

//     if (phone_number) {
//       socket.emit("user_online", phone_number); // notify backend
//     }
//   });

//   // 🔄 Handle reconnect
//   socket.on("reconnect", () => {
//     console.log("🔄 Reconnected:", socket.id);

//     const state = store.getState();
//     const phone_number = state.auth?.user?.phone_number;

//     if (phone_number) {
//       socket.emit("user_online", phone_number); // re-announce online
//     }
//   });

//   /**
//    * ✅ Events for chat socket
//    */
//   if (name === "chat") {
//     // Status update
//     socket.on("status_update", (data) => {
//       store.dispatch(setOnlineUsers(data));
//     });

//     // Typing indicators
//     socket.on("user_typing", (data) => {
//       store.dispatch(setTyping({ userId: data.userId, isTyping: true }));
//     });

//     socket.on("stop_typing", (data) => {
//       store.dispatch(setTyping({ userId: data.userId, isTyping: false }));
//     });

//     // Incoming message
//     socket.on("receive_message", (msg) => {
//       console.log("📩 New message:", msg);
//       store.dispatch(addMessage(msg));
//     });

//     // Notifications
//     socket.on("receive_notification", (notification) => {
//       console.log("🔔 Notification:", notification);
//       // You can dispatch to Redux or show a toast
//     });
//   }

// socket.on("disconnect", () => {
//   console.log("❌ Disconnected:", socket.id);
//   const { user } = store.getState().auth || {};
//   if (user?.id) {
//     socket.emit("user_offline", user.id);
//   }
// });


//   sockets[name] = socket;
//   return socket;
// };








