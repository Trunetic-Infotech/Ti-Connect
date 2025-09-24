import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import ConnectDB from "./config/Database.js";
import AuthRoutes from "./routes/UserRoutes/AuthRoutes.js";
import MessageRoutes from "./routes/messageRoutes/messageRoutes.js"
import { app, server } from "../src/utils/socket/socket.js";
import groupRoutes from "./routes/messageRoutes/groupeRoutes.js";
import cookieParser from "cookie-parser";

dotenv.config();

app.use(
  cors({
    origin: [
      "*",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
const PORT = process.env.PORT || 5000;
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("<h1>Welcome to the Chat Application Backend!</h1>");
});

// ConnectDB.connect();
app.use("/api/v1", AuthRoutes);
app.use("/api/v1", MessageRoutes);
app.use("/api/v1", groupRoutes);
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
