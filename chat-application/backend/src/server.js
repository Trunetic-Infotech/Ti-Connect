import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import ConnectDB from "./config/Database.js";
import AuthRoutes from "./routes/UserRoutes/AuthRoutes.js";
import { app, server } from "../src/utils/socket/socket.js";
dotenv.config();

app.use(
  cors({
    origin: [
      "http://localhost:8081",
      "http://localhost:8080",
      "http://192.168.1.43:8081",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("<h1>Welcome to the Chat Application Backend!</h1>");
});

// ConnectDB.connect();
app.use("/api/v1", AuthRoutes);

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
