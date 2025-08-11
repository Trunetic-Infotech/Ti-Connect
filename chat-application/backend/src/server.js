// import express from "express";
// import cors from "cors";
// import morgan from "morgan";
// import cookieParser from "cookie-parser";
// import dotenv from "dotenv";
// import { Server } from "socket.io";
// import http from "http";
// import  ConnectDB  from "./config/Database.js";
// import users from "./config/Database.js"
// import AuthRoutes from "./routes/UserRoutes/AuthRoutes.js";
// dotenv.config();
// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { origin: "*" }
// });
// const PORT = process.env.PORT || 5000;
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors());
// app.use(morgan("dev"));
// app.use(cookieParser());


// // Store io globally so controllers can access it
// global.io = io;

// app.get("/",(req, res) => {
//   res.send("<h1>Welcome to the Chat Application Backend!</h1>");
// });

// let onlineUsers = {};

// io.on("connection", (socket) => {
//   console.log("Socket connected:", socket.id);

//   socket.on("user_online", async (phone_number) => {
//     onlineUsers[phone_number] = socket.id;

//     await users.execute(
//       "UPDATE users SET status = 'Online', last_seen_at = NULL WHERE phone_number = ?",
//       [phone_number]
//     );

//     io.emit("status_update", { userId: phone_number, status: "Online" });
//   });

//   socket.on("disconnect", async () => {
//     const userId = Object.keys(onlineUsers).find(
//       (key) => onlineUsers[key] === socket.id
//     );

//     if (phone_number) {
//       await users.execute(
//         "UPDATE users SET status = 'Last_Seen', last_seen_at = NOW() WHERE phone_number = ?",
//         [phone_number]
//       );
//       delete onlineUsers[phone_number];
//       io.emit("status_update", { userId: phone_number, status: "Last_Seen" });
//     }
//   });
// });

// // ConnectDB.connect();
// app.use("/api/v1", AuthRoutes);

// server.listen(PORT, () => {
//     console.log(`🚀 Server running at http://localhost:${PORT}`);
// });
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import ConnectDB from "./config/Database.js";
import users from "./config/Database.js";
import AuthRoutes from "./routes/UserRoutes/AuthRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());

// Global socket reference
global.io = io;

app.get("/", (req, res) => {
  res.send("<h1>Welcome to the Chat Application Backend!</h1>");
});


io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token provided"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.phone_number = decoded.phone_number; // Store in socket instance
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

let onlineUsers = {};

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  console.log(`✅ Socket connected: ${socket.phone_number}`);
  // User goes online
  socket.on("user_online", async (phone_number) => {
    onlineUsers[phone_number] = socket.id;

    await users.execute(
      "UPDATE users SET status = 'Online', last_seen_at = NULL WHERE phone_number = ?",
      [phone_number]
    );

    io.emit("status_update", { phone_number, status: "Online" });
  }); 

  // User disconnects
  socket.on("disconnect", async () => {
    const phone_number = Object.keys(onlineUsers).find(
      (key) => onlineUsers[key] === socket.id
    );

    if (phone_number) {
      await users.execute(
        "UPDATE users SET status = 'Last_Seen', last_seen_at = NOW() WHERE phone_number = ?",
        [phone_number]
      );
      delete onlineUsers[phone_number];
      io.emit("status_update", { phone_number, status: "Last_Seen" });
    }
  });
});

// Connect DB
// await ConnectDB();

// Routes
app.use("/api/v1", AuthRoutes);

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
