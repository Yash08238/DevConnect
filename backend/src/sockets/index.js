const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

exports.initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected to socket: ${socket.user.id}`);
    
    // Join a room with the user's ID to receive personal notifications
    socket.join(socket.user.id);

    socket.on("disconnect", () => {
      console.log(`User disconnected from socket: ${socket.user.id}`);
    });
  });

  return io;
};

exports.getIo = () => {
  if (!io) {
    console.warn("Socket.io not initialized");
  }
  return io;
};
