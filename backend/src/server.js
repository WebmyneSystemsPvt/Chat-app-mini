require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/db");
const { errorHandler } = require("./middleware/errorHandler");
const { getLogger, stream } = require("./utils/logger");
const { sanitizeRequest } = require("./utils/validation");
const { apiLimiter } = require("./middleware/rateLimiter");
const routes = require("./routes");
const { initializeSocket } = require("./sockets");

const logger = getLogger();

(async () => {
  // Initialize express app
  const app = express();
  const server = http.createServer(app);

  // Database connection
  try {
    await connectDB();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error(`Failed to connect to database: ${error.message}`);
    process.exit(1);
  }

  // Trust proxy (if behind a reverse proxy like Nginx)
  app.set("trust proxy", 1);

  // Security middleware
  if (process.env.HELMET_ENABLED !== "false") {
    app.use(helmet());
  }
  
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || process.env.CLIENT_URL || "*",
      credentials: true,
      methods: (process.env.CORS_METHODS || "GET,POST,PUT,DELETE,OPTIONS").split(","),
      allowedHeaders: (process.env.CORS_ALLOWED_HEADERS || "Content-Type,Authorization").split(","),
    })
  );

  // Request logging
  app.use(morgan("combined", { stream }));

  // Body parser
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  // Cookie parser
  app.use(cookieParser(process.env.COOKIE_SECRET));

  // Sanitize request data
  app.use(sanitizeRequest);

  // Rate limiting
  if (process.env.RATE_LIMIT_ENABLED !== "false") {
    app.use(apiLimiter);
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    logger.info("Health check endpoint accessed");
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API routes
  app.use("/", routes);

  // Error handling middleware
  app.use(errorHandler);

  // Initialize Socket.IO
  const io = initializeSocket(server);
  app.set("io", io);

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise} reason: ${reason}`);
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    logger.error(`Uncaught Exception: ${error.message}`);
  });

  // Handle SIGTERM (for Docker/Heroku)
  process.on("SIGTERM", () => {
    logger.info("SIGTERM received. Shutting down gracefully");
    server.close(() => {
      logger.info("Process terminated");
      process.exit(0);
    });
  });

  // Start server
  const PORT = process.env.PORT || 3001;
  const NODE_ENV = process.env.NODE_ENV || "development";

  server.listen(PORT, () => {
    logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    logger.info(`Database: ${process.env.MONGODB_URI}`);
    logger.info(`Client URL: ${process.env.CLIENT_URL || "Not set"}`);
    logger.info(`Environment: ${NODE_ENV}`);
  });

  module.exports = { app, server };
})();
