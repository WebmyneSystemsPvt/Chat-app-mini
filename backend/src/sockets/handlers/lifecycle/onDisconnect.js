const User = require("../../../models/User");
const { connections } = require("../../store");
const { getLogger } = require("../../../utils/logger");

function registerDisconnect(io, socket) {
  const logger = getLogger();
  const userIdStr = socket.user._id.toString();
  const userId = socket.user._id;

  // Handle client-initiated disconnect
  socket.on("connection:disconnect", async (callback) => {
    try {
      logger.info(
        `User ${userIdStr} (socket ${socket.id}) requested disconnect`
      );

      // Remove socket from connections store
      connections.deleteSocket(userIdStr, socket.id);
      logger.debug(
        `Removed socket ${socket.id} from connections for user ${userIdStr}`
      );

      const payload = { userId, online: false };

      // If no more active connections for this user, mark them offline
      if (!connections.has(userIdStr)) {
        const now = new Date();
        await User.findByIdAndUpdate(userId, {
          online: false,
          lastSeen: now,
        });
        logger.info(
          `User ${userIdStr} marked as offline, lastSeen: ${now.toISOString()}`
        );

        // Notify other users about this user going offline
        socket.broadcast.emit("user:status", {
          userId,
          online: false,
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
          lastSeen: now.toISOString(),
        });

        payload.lastSeen = now.toISOString();
      }

      callback?.({
        success: true,
        message: "Successfully disconnected from the server",
        payload,
      });

      // Disconnect the socket after sending the callback
      socket.disconnect(true);
    } catch (error) {
      logger.error(
        `Error handling connection:disconnect for user ${userIdStr}: ${error.message}`,
        { stack: error.stack, userId: userIdStr, socketId: socket.id }
      );

      callback?.({
        success: false,
        message: "Failed to disconnect",
        error: error.message || "Internal server error",
      });
    }
  });
}

module.exports = { registerDisconnect };
