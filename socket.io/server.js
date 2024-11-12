const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  users.push(socket.id);

  if (users.length === 2) {
    io.to(users[0]).emit(
      "chatStarted",
      `You are chatting with user ${users[1]}`
    );
    io.to(users[1]).emit(
      "chatStarted",
      `You are chatting with user ${users[0]}`
    );
  }

  socket.on("chatMessage", (msg) => {
    const receiverId = users.find((id) => id !== socket.id);

    console.log(`Message from ${socket.id}: ${msg}`);

    if (receiverId) {
      io.to(receiverId).emit("chatMessage", {
        sender: socket.id,
        message: msg,
      });
    } else {
      socket.emit("errorMessage", "Waiting for another user to connect...");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    users = users.filter((id) => id !== socket.id);

    if (users.length === 1) {
      io.to(users[0]).emit(
        "errorMessage",
        "Your chat partner has disconnected."
      );
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
