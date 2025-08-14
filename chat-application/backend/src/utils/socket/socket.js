import { Server } from "socket.io";
import http from "http";
import express from "express";
import chat_messages from "../../config/Database.js"; 
import users from "../../config/Database.js"
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8081", "http://192.168.1.41:8081", "http://localhost:5000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// Used to store online users { userId: socketId }
const userSocketMap = {};

// Helper function
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  let currentUserPhone = null; // Store phone for disconnect

  // When user comes online
  socket.on("user_online", async (phone_number) => {
    console.log("📱 User online:", phone_number);
    currentUserPhone = phone_number;
    userSocketMap[phone_number] = socket.id;

    await users.execute(
      "UPDATE users SET status = 'Online', last_seen_at = NULL WHERE phone_number = ?",
      [phone_number]
    );

    io.emit("status_update", { userId: phone_number, status: "Online" });
  });

  // When a message is sent
  socket.on("add_message", async (data) => {
    const { sender_id, receiver_id, message } = data;

    if (!sender_id || !receiver_id || !message) {
      return socket.emit("error", { message: "Sender ID, Receiver ID, and Message are required" });
    }

    const [result] = await chat_messages.execute(
      "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
      [sender_id, receiver_id, message]
    );

    const newMessage = {
      id: result.insertId,
      sender_id,
      receiver_id,
      message,
      created_at: new Date(),
    };

    // Send message to the receiver if online
    const receiverSocketId = getReceiverSocketId(receiver_id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", newMessage);
    }
  });

  // Typing indicator
  socket.on("user_typing", (phone_number) => {
    socket.broadcast.emit("user_typing", { userId: phone_number });
  });

  // When user disconnects
  socket.on("disconnect", async () => {
    if (currentUserPhone) {
      await users.execute(
        "UPDATE users SET status = 'Last_Seen', last_seen_at = NOW() WHERE phone_number = ?",
        [currentUserPhone]
      );

      delete userSocketMap[currentUserPhone];
      io.emit("status_update", { userId: currentUserPhone, status: "Last_Seen" });
    }
    console.log("❌ User disconnected:", socket.id);
  });
});

export { io, app, server };
