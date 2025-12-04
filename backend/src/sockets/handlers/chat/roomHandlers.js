const { getLogger } = require("../../../utils/logger");
const { joinRoom, leaveRoom } = require("../../helpers/roomManager");
const {
  getRoomName,
  getConversationParticipants,
} = require("../../helpers/room");

const logger = getLogger();

function registerRoomHandlers(io, socket) {
  socket.on("conversation:join", async ({ conversationId }) => {
    try {
      const userId = socket.user._id.toString();
      const roomName = getRoomName(conversationId);
      const participants = await getConversationParticipants(conversationId);
      const otherParticipants = participants.filter((id) => id !== userId);

      logger.info(`User ${userId} joining conversation ${conversationId}`, {
        roomName,
        participantCount: participants.length,
      });

      const success = joinRoom(userId, roomName, io);

      if (success) {
        otherParticipants.forEach((participantId) => {
          joinRoom(participantId, roomName, io);
        });
      } else {
        throw new Error(`Failed to join conversation ${conversationId}`);
      }

      logger.debug(
        `User ${userId} successfully joined conversation ${conversationId}`
      );
    } catch (error) {
      logger.error(`Error joining conversation: ${error.message}`, {
        error,
        conversationId,
        userId: socket.user._id,
      });

      socket.emit("error", {
        code: "JOIN_CONVERSATION_ERROR",
        message: `Failed to join conversation: ${error.message}`,
      });
    }
  });

  socket.on("conversation:leave", ({ conversationId }) => {
    try {
      const userId = socket.user._id.toString();
      const roomName = getRoomName(conversationId);

      logger.info(`User ${userId} leaving conversation ${conversationId}`, {
        roomName,
      });

      const success = leaveRoom(userId, roomName, io);

      if (success) {
        logger.debug(`User ${userId} left conversation ${conversationId}`);
        socket.to(roomName).emit("user:left", {
          userId,
          conversationId,
          roomName,
        });
      } else {
        logger.warn(
          `User ${userId} failed to leave conversation ${conversationId}`
        );
      }
    } catch (error) {
      logger.error(`Error leaving conversation: ${error.message}`, {
        error,
        conversationId,
        userId: socket.user._id,
      });
    }
  });
}

module.exports = { registerRoomHandlers };
