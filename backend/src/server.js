require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");
const { initSocket } = require("./sockets");

// Import routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
const commentRoutes = require("./routes/comment.routes");
const communityRoutes = require("./routes/community.routes");
const notificationRoutes = require("./routes/notification.routes");
const jobRoutes = require("./routes/job.routes");
const searchRoutes = require("./routes/search.routes");

const app = express();
const server = http.createServer(app);

// Init Socket.IO
initSocket(server);

// Connect to Database
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // Logging
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(apiLimiter); // Apply rate limiter to all API routes

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/search", searchRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("DevConnect API is running...");
});

// Handle 404
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});