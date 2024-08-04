import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const port = 3000;
const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello WOrld");
});

const secretKey = "mysecretkey";
app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: "abcdefghij" }, secretKey, { expiresIn: "1h" });
  res
    .cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
    .json({ message: "login Success" });
});

io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res, (err) => {
    if (err) return next(err);

    const token = socket.request.cookies.token;
    if (!token) return next(new Error("Authentication Error"));

    const decoded = jwt.verify(token, secretKey);
    // if(decoded) return  next(new Error("Authentication Error"))
    next();
  });
});

io.on("connection", (socket) => {
  console.log("User Connected");
  console.log("Id", socket.id);
  // socket.emit("welcome", `welcome to server, ${socket.id}`);
  // socket.broadcast.emit("welcome", `${socket.id} joined the server`);

  socket.on("message", ({ message, room, isSender }) => {
    // Broadcast to others in the room
    socket.to(room).emit("receive-message", { message, isSender: false });
    // Send to the sender
    socket.emit("receive-message", { message, isSender: true });
  });

  socket.on("join-room", (room) => {
    socket.join(room);
  });

  socket.on("disconnect", () => {
    console.log(`User Disconnected ${socket.id}`);
  });

  return () => {
    socket.disconnect();
  };
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
