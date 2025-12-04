const { Server } = require("socket.io");
const customParser = require("socket.io-msgpack-parser");

const { socketAuth } = require("../middleware/auth");
const { connections } = require("./store");
const {
  registerDirectHandlers,
} = require("./handlers/direct/registerDirectHandlers");
const {
  registerUserProfileHandlers,
} = require("./handlers/user/userProfileHandlers");
const {
  registerConnectionHandlers,
} = require("./handlers/lifecycle/onConnect");
const { registerDisconnect } = require("./handlers/lifecycle/onDisconnect");
const { joinPersonalRoom } = require("./helpers/room");
const { getLogger } = require("../utils/logger");
const { registerRoomHandlers } = require("./handlers/chat/roomHandlers");

const initializeSocket = (server) => {
  const logger = getLogger();
  const io = new Server(server, {
    connectionStateRecovery: {},
    parser: customParser,
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 10000,
    pingInterval: 25000,
  });

  // Socket.IO middleware
  io.use(socketAuth);

  io.engine.on("connection", (rawSocket) => {
    rawSocket.request = null;
  });

  io.on("connection", async (socket) => {
    const userIdStr = socket.user._id.toString();
    logger.info(`Socket connected: ${userIdStr} (socket ID: ${socket.id})`);

    try {
      // Add user to active connections
      const previouslyConnected = connections.has(userIdStr);
      connections.set(userIdStr, socket.id);
      logger.debug(`Added socket ${socket.id} for user ${userIdStr}`);

      // Join personal room
      joinPersonalRoom(socket, userIdStr);
      logger.debug(`User ${userIdStr} joined personal room: user_${userIdStr}`);

      // Connection setup (status updates only)
      await registerConnectionHandlers(io, socket, previouslyConnected);

      // Register modular handlers
      registerDirectHandlers(io, socket);
      registerUserProfileHandlers(io, socket);
      registerDisconnect(io, socket);
      registerRoomHandlers(io, socket);
    } catch (err) {
      logger.error(
        `Socket connection setup error for user ${userIdStr}: ${err.message}`,
        { stack: err.stack }
      );
      socket.emit("connection:error", {
        message: "Failed to set up socket connection",
        error: err.message || "Internal server error",
      });
      socket.disconnect(true); // Force disconnect on error
    }
  });

  logger.info("Socket.IO server initialized");
  return io;
};

module.exports = { initializeSocket };
