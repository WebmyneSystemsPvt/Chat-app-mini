const mongoose = require("mongoose");
const { UnauthorizedError } = require("../../../utils/errors");
const User = require("../../../models/User");
const { Message } = require("../../../models/Message");
const { getLogger } = require("../../../utils/logger");

function isValidObjectId(id) {
  const logger = getLogger();
  const isValid = mongoose.Types.ObjectId.isValid(id);
  logger.debug(`Validating ObjectId: ${id} - ${isValid ? "Valid" : "Invalid"}`);
  return isValid;
}

async function checkDirectParticipant(messageId, userId) {
  const logger = getLogger();
  try {
    logger.debug(
      `Checking participant for messageId: ${messageId}, userId: ${userId}`
    );
    if (!isValidObjectId(messageId) || !isValidObjectId(userId)) {
      logger.warn(`Invalid ID - messageId: ${messageId}, userId: ${userId}`);
      throw new Error("Invalid ID");
    }
    const message = await Message.findById(messageId);
    if (!message || message.type !== "direct") {
      logger.warn(`Message not found or not direct: ${messageId}`);
      throw new Error("Message not found or not direct");
    }
    const userIdStr = userId.toString();
    const isParticipant =
      message.sender.toString() === userIdStr ||
      message.recipient?.toString() === userIdStr;
    if (!isParticipant) {
      logger.warn(`User ${userId} not authorized for message: ${messageId}`);
      throw new UnauthorizedError("Not authorized for this message");
    }
    const isSender = message.sender.toString() === userIdStr;
    logger.debug(
      `User ${userId} is ${isSender ? "sender" : "recipient"} for message: ${messageId}`
    );
    return { message, isSender };
  } catch (err) {
    logger.error(
      `Error checking participant for messageId ${messageId}: ${err.message}`,
      { stack: err.stack }
    );
    // throw err;
  }
}

async function validateRecipient(to) {
  const logger = getLogger();
  try {
    logger.debug(`Validating recipient ID: ${to}`);
    if (!isValidObjectId(to)) {
      logger.warn(`Invalid recipient ID: ${to}`);
      throw new Error("Invalid recipient ID");
    }
    const user = await User.findOne({ _id: to });
    if (!user) {
      logger.warn(`Recipient not found: ${to}`);
      throw new Error("Recipient not found");
    }
    logger.debug(`Recipient validated: ${to}`);
    return user;
  } catch (err) {
    logger.error(`Error validating recipient ${to}: ${err.message}`, {
      stack: err.stack,
    });
    throw err;
  }
}

async function validateReplyTo(replyTo, sender, recipient) {
  const logger = getLogger();
  if (!replyTo) return;
  try {
    logger.debug(`Validating replyTo message: ${replyTo}`);
    if (!isValidObjectId(replyTo)) {
      logger.warn(`Invalid replyTo ID: ${replyTo}`);
      throw new Error("Invalid replyTo ID");
    }
    const exists = await Message.exists({
      _id: replyTo,
      type: "direct",
      $or: [
        { sender, recipient },
        { sender: recipient, recipient: sender },
      ],
    });
    if (!exists) {
      logger.warn(`ReplyTo message not found: ${replyTo}`);
      throw new Error("ReplyTo message not found");
    }
    logger.debug(`ReplyTo message validated: ${replyTo}`);
  } catch (err) {
    logger.error(`Error validating replyTo ${replyTo}: ${err.message}`, {
      stack: err.stack,
    });
    throw err;
  }
}

function validateAttachments(attachments) {
  const logger = getLogger();
  logger.debug(`Validating attachments: ${attachments?.length || 0} items`);
  if (attachments && !Array.isArray(attachments)) {
    logger.warn("Attachments must be an array");
    throw new Error("Attachments must be an array");
  }
  if (attachments && attachments.length > 10) {
    logger.warn(`Too many attachments: ${attachments.length} (max 10)`);
    throw new Error("Too many attachments (max 10)");
  }
  logger.debug("Attachments validated successfully");
}

module.exports = {
  isValidObjectId,
  checkDirectParticipant,
  validateRecipient,
  validateReplyTo,
  validateAttachments,
};
