import { Server } from "socket.io";
import http from "http";
import express from "express";
import chat_messages from "../../config/Database.js";
import users from "../../config/Database.js";

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS support
const io = new Server(server, {
  cors: {
    origin: ["*"], // TODO: change to specific frontend URLs in production
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// Map to keep track of online users: { userId/phoneNumber: socketId }
const userSocketMap = {};

// Helper function to get a user's socket ID
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  let currentUserPhone = null; // to keep track of the user associated with this socket

  /**
   * 🔹 User comes online
   */
  socket.on("user_online", async (phone_number) => {
    console.log("📱 User online:", phone_number);
    currentUserPhone = phone_number;

    // Store mapping: user phone → socket id
    userSocketMap[phone_number] = socket.id;

    // Update DB status
    await users.execute(
      "UPDATE users SET status = 'Online', last_seen_at = NULL WHERE phone_number = ?",
      [phone_number]
    );

    // Broadcast to everyone that this user is now online
    io.emit("status_update", { userId: phone_number, status: "Online" });
  });

  /**
   * 🔹 Client requests the list of currently online users
   */
  socket.on("getOnlineUsers", () => {
    const onlineUserIds = Object.keys(userSocketMap);
    socket.emit("onlineUsers", onlineUserIds);
  });

  /**
   * 🔹 Send a one-to-one message
   */
  socket.on("add_message", async (data) => {
    const { sender_id, receiver_id, message } = data;

    if (!sender_id || !receiver_id || !message) {
      return socket.emit("error", {
        message: "Sender ID, Receiver ID, and Message are required",
      });
    }

    // Save message in DB
    const [result] = await chat_messages.execute(
      "INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
      [sender_id, receiver_id, message]
    );

    const newMessage = {
      id: result.insertId,
      sender_id,
      receiver_id,
      message,
      created_at: new Date(),
    };

    // Send message to the receiver if they are online
    const receiverSocketId = getReceiverSocketId(receiver_id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", newMessage);
    }

    // (Optional) Also send back to sender to confirm delivery
    socket.emit("message_sent", newMessage);
  });

  /**
   * 🔹 Group Chat: Join a group
   */
  socket.on("join_group", ({ groupId }) => {
    if (groupId) {
      socket.join(groupId); // Socket.IO room
      console.log(`👥 User ${socket.id} joined group ${groupId}`);
      socket.emit("group_joined", { groupId });
    }
  });

  /**
   * 🔹 Group Chat: Send message to a group
   */
  socket.on("group_message", async ({ sender_id, groupId, message }) => {
    if (!sender_id || !groupId || !message) {
      return socket.emit("error", {
        message: "Sender ID, Group ID, and Message are required",
      });
    }

    // Store in DB (if you have a group_messages table)
    await chat_messages.execute(
      "INSERT INTO group_messages (group_id, sender_id, message) VALUES (?, ?, ?)",
      [groupId, sender_id, message]
    );

    const newGroupMessage = {
      sender_id,
      group_id: groupId,
      message,
      created_at: new Date(),
    };

    // Broadcast to all members in the group (room)
    io.to(groupId).emit("group_message", newGroupMessage);
  });

  /**
   * 🔹 Typing indicator
   */
  socket.on("user_typing", (phone_number) => {
    socket.broadcast.emit("user_typing", { userId: phone_number });
  });

  /**
   * 🔹 Stop typing indicator
   */
  socket.on("stop_typing", (phone_number) => {
    socket.broadcast.emit("stop_typing", { userId: phone_number });
  });

  // send Notification to user

  socket.on("send_notification", ({ receiver_id, notification }) => {
    const receiverSocketId = getReceiverSocketId(receiver_id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_notification", notification);
    }
  });




  /**
   * 🔹 User disconnects
   */
  socket.on("disconnect", async () => {
    if (currentUserPhone) {
      // Update DB: set last seen timestamp
      await users.execute(
        "UPDATE users SET status = 'Last_Seen', last_seen_at = NOW() WHERE phone_number = ?",
        [currentUserPhone]
      );

      // Remove from online map
      delete userSocketMap[currentUserPhone];

      // Notify others
      io.emit("status_update", {
        userId: currentUserPhone,
        status: "Last_Seen",
      });
    }
    console.log("❌ User disconnected:", socket.id);
  });
});

export { io, app, server };
