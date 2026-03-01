const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const messageHistory = {}; // Store messages room-wise

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);

    if (!messageHistory[room]) {
      messageHistory[room] = [];
    }

    // Send previous messages to new user
    socket.emit("message_history", messageHistory[room]);
  });

  socket.on("send_message", (data) => {
    const { room } = data;

    if (!messageHistory[room]) {
      messageHistory[room] = [];
    }

    messageHistory[room].push(data);

    // Send to everyone INCLUDING sender (only once)
    io.to(room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});