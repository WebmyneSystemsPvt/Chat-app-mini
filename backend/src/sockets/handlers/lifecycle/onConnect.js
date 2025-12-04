const User = require("../../../models/User");
const { connections } = require("../../store");
const { joinPersonalRoom } = require("../../helpers/room");
const { handleReconnect } = require("../../helpers/roomManager");
const { getLogger } = require("../../../utils/logger");

function registerConnectionHandlers(io, socket) {
  const logger = getLogger();
  const userIdStr = socket.user._id.toString();
  const userId = socket.user._id;

  socket.on("connection:init", async (data, callback) => {
    try {
      logger.debug(`Setting up connection for user ${userIdStr}`);

      // Add socket to connections store
      connections.set(userId, socket.id);
      logger.info(`Added socket ${socket.id} for user ${userIdStr}`);

      // Join user to their personal room
      const personalRoom = joinPersonalRoom(socket, userIdStr);
      logger.debug(`User ${userIdStr} joined personal room ${personalRoom}`);

      // Handle reconnection - rejoin all rooms
      const previouslyConnected = data?.previouslyConnected || false;
      if (previouslyConnected) {
        handleReconnect(userId, socket.id, io);
        logger.debug(`Handled reconnection for user ${userIdStr}`);
      } else {
        // First connection for this user
        await User.findByIdAndUpdate(userId, {
          online: true,
          lastSeen: null,
        });
        logger.info(`User ${userIdStr} marked as online`);

        // Notify others
        socket.broadcast.emit("user:status", {
          userId,
          online: true,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
        });
        logger.debug(`Emitted user:status (online) for user ${userIdStr}`);
      }

      callback?.({
        success: true,
        message: "Successfully connected to the server",
        userId,
      });
    } catch (err) {
      logger.error(
        `Error setting up connection for user ${userIdStr}: ${err.message}`,
        { stack: err.stack }
      );

      callback?.({
        success: false,
        message: "Failed to set up connection",
        error: err.message || "Internal server error",
      });
    }
  });
}

module.exports = { registerConnectionHandlers };
