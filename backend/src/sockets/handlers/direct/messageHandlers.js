const { Message } = require("../../../models/Message");
const { connections } = require("../../store");
const {
  checkDirectParticipant,
  validateRecipient,
  validateReplyTo,
  isValidObjectId,
} = require("./helpers");
const {
  getConversationByMembersHash,
  createDirectConversation,
} = require("./conversation");
const { createDMMembersHash } = require("../../../utils/conversation");
const { getLogger } = require("../../../utils/logger");
const { getRoomName, generatePersonalRoomName } = require("../../helpers/room");
const { joinRoom } = require("../../helpers/roomManager");
const { convertToObjectId } = require("../../../utils/db");
const ERROR_CODES = require("../../../utils/error_codes");

function registerMessageHandlers(io, socket) {
  const logger = getLogger();
  const userIdStr = socket.user._id.toString();

  // Send direct message
  socket.on("message:send", async (data, callback) => {
    try {
      logger.debug(`Message send request from user: ${userIdStr}`);
      const { to, content, replyTo, requestId } = data || {};

      if (!to) throw new Error("Recipient required");
      const trimmedContent = (content || "").trim();
      if (!trimmedContent) throw new Error("Message content required");

      const fromUser = socket.user;
      const toUser = await validateRecipient(to);
      await validateReplyTo(replyTo, fromUser._id, toUser._id);

      const membersHash = createDMMembersHash(fromUser._id, toUser._id);
      let conversation = await getConversationByMembersHash(membersHash);

      if (!conversation) {
        conversation = await createDirectConversation({
          membersHash,
          fromUser,
          toUser,
          memberIds: [fromUser._id, toUser._id],
        });

        const roomName = getRoomName(conversation._id);
        joinRoom(fromUser._id.toString(), roomName, io);
        joinRoom(toUser._id.toString(), roomName, io);
        logger.info(`Created new conversation and joined room: ${roomName}`);
      }

      const message = new Message({
        sender: convertToObjectId(fromUser._id),
        recipient: toUser._id,
        content: trimmedContent,
        type: "direct",
        replyTo: replyTo || null,
        conversationId: conversation._id,
        requestId,
      });

      await message.save();

      conversation.lastMessage = {
        messageId: message._id,
        senderId: fromUser._id,
        text: trimmedContent,
        createdAt: Date.now(),
      };
      await conversation.save();

      const updatedMessage = await message.populate([
        { path: "sender", select: "_id firstName lastName email" },
        { path: "recipient", select: "_id firstName lastName email" },
      ]);

      // Emit to recipient if online
      const recipientSocketIds = connections.get(toUser._id.toString());
      if (recipientSocketIds) {
        for (const socketId of recipientSocketIds) {
          if (io.sockets.sockets.has(socketId)) {
            io.to(socketId).emit("message:receive", {
              message: updatedMessage,
              conversation,
            });
          }
        }
      }

      io.to(generatePersonalRoomName(fromUser._id)).emit("message:send", {
        messages: [updatedMessage],
        conversation,
      });

      callback?.({
        success: true,
        messages: [updatedMessage],
        conversation,
      });
    } catch (error) {
      logger.error(
        `Error sending message from ${userIdStr}: ${error.message}`,
        { stack: error.stack }
      );

      let errCode = ERROR_CODES.INTERNAL;
      if (error.name === "MongoServerError" && error.code == 11000) {
        errCode = ERROR_CODES.MESSAGE_DUPLICATE_REQUEST_ID;
      }

      callback?.({
        success: false,
        error: error.message || "Failed to send message",
        errCode,
      });
    }
  });

  // Delete a direct message
  socket.on("message:delete", async (data, callback) => {
    try {
      const { messageId, forEveryone } = data || {};
      if (!messageId) throw new Error("messageId required");

      const { message, isSender } = await checkDirectParticipant(
        messageId,
        socket.user._id
      );
      const currentUserId = socket.user._id.toString();
      const otherId = isSender
        ? message.recipient.toString()
        : message.sender.toString();

      let payload;
      if (forEveryone) {
        if (!isSender) throw new Error("Only sender can delete for everyone");
        if (!message.isDeleted) {
          message.isDeleted = true;
          message.deletedAt = new Date();
          message.deletedBy = socket.user._id;
          await message.save();
        }
        payload = {
          messageId: message._id,
          forEveryone: true,
          deletedBy: currentUserId,
          deletedAt: message.deletedAt.toISOString(),
        };
        if (otherId && connections.has(otherId)) {
          connections.get(otherId).forEach((socketId) => {
            if (io.sockets.sockets.has(socketId)) {
              io.to(socketId).emit("message:deleted", payload);
            }
          });
        }
      } else {
        const alreadyHidden = (message.deletedFor || []).some(
          (u) => u.toString() === currentUserId
        );
        if (!alreadyHidden) {
          message.deletedFor = [...(message.deletedFor || []), socket.user._id];
          if (
            message.recipient?.toString() === currentUserId &&
            message.status !== "read"
          ) {
            message.status = "read";
          }
          await message.save();
          logger.info(`Message ${messageId} hidden for user: ${userIdStr}`);
        }
        payload = {
          messageId: message._id,
          forEveryone: false,
        };
      }

      callback?.({ success: true, message: payload });
    } catch (error) {
      callback?.({
        success: false,
        error: error.message || "Failed to delete message",
      });
    }
  });

  // Clear chat for self
  socket.on("chat:clear", async (data, callback) => {
    try {
      const { withUserId } = data || {};
      if (!withUserId) throw new Error("withUserId required");
      if (!isValidObjectId(withUserId)) throw new Error("Invalid withUserId");

      const currentUserId = socket.user._id;
      await Message.updateMany(
        {
          $or: [
            { sender: currentUserId, recipient: withUserId },
            { sender: withUserId, recipient: currentUserId },
          ],
          type: "direct",
          deletedFor: { $ne: currentUserId },
        },
        { $addToSet: { deletedFor: currentUserId } }
      );

      callback?.({ success: true, message: { withUserId } });
    } catch (error) {
      callback?.({
        success: false,
        error: error.message || "Failed to clear chat",
      });
    }
  });
}

module.exports = { registerMessageHandlers };
