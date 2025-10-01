// export { io, app, server, userSocketMap };
import { Server } from "socket.io";
import http from "http";
import express from "express";
import users from "../../config/Database.js"; // ✅ use single DB instance

// Map to keep track of online users: { userId: socketId }
const userSocketMap = {};

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS support
const io = new Server(server, {
  cors: {
    origin: ["*"], // ⚠️ Change to specific frontend URLs in production
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// Socket.IO connection handler
// io.on("connection", (socket) => {
//   console.log("✅ User connected:", socket.id);

//  const userId = socket.handshake.query.id;

//  if(userId){
//   userSocketMap[userId] = socket.id;
//  }

//  io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   socket.on("disconnect", async () => {
//     const currentUserPhone = userId;
//     if (currentUserPhone) {
//       // Update DB: set last seen timestamp
//       await users.execute(
//         "UPDATE users SET status = 'inactive', last_seen_at = NOW() WHERE phone_number = ?",
//         [currentUserPhone]
//       );

//       // Remove from online map
//       delete userSocketMap[userId];

//       // Notify others
//       io.emit("status_update", {
//         userId: currentUserPhone,
//         status: "inactive",
//       });
//     }
//     console.log("❌ User disconnected:", socket.id);
//   });
// });

// Sairaj
// Listen for messages from client
io.on("connection", (socket) => {
  const userId = socket.handshake.query.id;
  console.log("User connected:", userId, "SocketID:", socket.id);

  if (userId) userSocketMap[userId] = socket.id;

  /**
   * 🔹 User comes online
   */
  socket.on("user_online", async (id) => {
    console.log("📱 User online:", id);

    // Save socket mapping
    userSocketMap[id] = socket.id;

    // Update DB
    await users.execute(
      "UPDATE users SET status = 'active', last_seen_at = NOW() WHERE id = ?",
      [id]
    );

    // Broadcast to all clients
    io.emit("status_update", { userId: id, status: "active" });
  });

  socket.on("sendMessage", async (data) => {
    const { senderId, receiverId, message } = data;

    try {
      // 1️⃣ Save message in DB
      await users.execute(
        "INSERT INTO messages (sender_id, receiver_id, message, created_at) VALUES (?, ?, ?, NOW())",
        [senderId, receiverId, message]
      );

      // 2️⃣ Emit message to receiver if online
      const receiverSocketId = getReceiverSocketId(receiverId);
      console.log("Receiver SocketID:", receiverSocketId); // Debug
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", {
          senderId,
          receiverId,
          message,
          createdAt: new Date(),
        });
      }

      // 3️⃣ Emit back to sender
      socket.emit("newMessage", {
        senderId,
        receiverId,
        message,
        createdAt: new Date(),
      });
    } catch (err) {
      console.log("Error saving message:", err);
    }
  });


  
 socket.on("joined_users", async ({ userId }) => {
      try {
        const [groups] = await group_members.execute(
          "SELECT group_id FROM group_members WHERE user_id = ?",
          [userId]
        );

        groups.forEach((g) => {
          socket.join(`group_${g.group_id}`);
          console.log(`✅ User ${userId} joined room group_${g.group_id}`);
        });

        socket.emit("joined_groups", { groups: groups.map((g) => g.group_id) });
      } catch (error) {
        console.error("❌ Error joining groups:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });

  // socket.on("disconnect", async  () => {
  //    if (userId) {
  //     delete userSocketMap[userId];

  //     // Update DB: mark inactive
  //     await users.execute(
  //       "UPDATE users SET status = 'inactive', last_seen_at = NOW() WHERE id = ?",
  //       [userId]
  //     );

  //        // Broadcast offline status
  //   io.emit("status_update", { userId, status: "inactive" });

  //     console.log("User disconnected:", userId);
  //   }
  // });
  socket.on("disconnect", async () => {
  console.log("❌ Client disconnected:", socket.id);

  if (userId) {
    delete userSocketMap[userId];

    // Update DB: mark inactive
    await users.execute(
      "UPDATE users SET status = 'inactive', last_seen_at = NOW() WHERE id = ?",
      [userId]
    );

    // Broadcast offline status
    io.emit("status_update", { userId, status: "inactive" });
  }
});

});

// Helper function to get a user's socket ID
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export { io, app, server, userSocketMap };
