const { getLogger } = require("../utils/logger");
const { isValidObjectId } = require("./handlers/direct/helpers");

const activeConnections = new Map();

const connections = {
  set(userId, socketId) {
    const logger = getLogger();
    logger.debug(`Attempting to set socket ${socketId} for user ${userId}`);

    if (!userId || !isValidObjectId(userId)) {
      logger.warn(`Invalid userId: ${userId}`);
      throw new Error("Invalid user ID");
    }

    if (!socketId || typeof socketId !== "string") {
      logger.warn(`Invalid socketId: ${socketId}`);
      throw new Error("Invalid socket ID");
    }

    const userIdStr = typeof userId === "string" ? userId : userId.toString();
    if (!activeConnections.has(userIdStr)) {
      activeConnections.set(userIdStr, new Set());
      logger.debug(`Created new connection set for user: ${userIdStr}`);
    }

    activeConnections.get(userIdStr).add(socketId);
    logger.info(`Added socket ${socketId} to user ${userIdStr}. Total sockets: ${activeConnections.get(userIdStr).size}`);
  },
  get(userId) {
    const logger = getLogger();
    logger.debug(`Fetching sockets for user: ${userId}`);

    if (!userId || !isValidObjectId(userId)) {
      logger.warn(`Invalid userId for get: ${userId}`);
      return new Set();
    }

    const userIdStr = typeof userId === "string" ? userId : userId.toString();
    const sockets = activeConnections.get(userIdStr) || new Set();
    logger.debug(`Retrieved ${sockets.size} sockets for user: ${userIdStr}`);
    return sockets;
  },
  delete(userId) {
    const logger = getLogger();
    logger.debug(`Attempting to delete all sockets for user: ${userId}`);

    if (!userId || !isValidObjectId(userId)) {
      logger.warn(`Invalid userId for delete: ${userId}`);
      return false;
    }

    const userIdStr = typeof userId === "string" ? userId : userId.toString();
    const deleted = activeConnections.delete(userIdStr);
    if (deleted) {
      logger.info(`Deleted all sockets for user: ${userIdStr}`);
    } else {
      logger.debug(`No sockets found to delete for user: ${userIdStr}`);
    }
    return deleted;
  },
  deleteSocket(userId, socketId) {
    const logger = getLogger();
    logger.debug(`Attempting to delete socket ${socketId} for user ${userId}`);

    if (!userId || !isValidObjectId(userId)) {
      logger.warn(`Invalid userId for deleteSocket: ${userId}`);
      return;
    }

    if (!socketId || typeof socketId !== "string") {
      logger.warn(`Invalid socketId for deleteSocket: ${socketId}`);
      return;
    }

    const userIdStr = typeof userId === "string" ? userId : userId.toString();
    const userSockets = activeConnections.get(userIdStr);
    if (userSockets) {
      userSockets.delete(socketId);
      logger.info(`Deleted socket ${socketId} for user ${userIdStr}. Remaining sockets: ${userSockets.size}`);
      if (userSockets.size === 0) {
        activeConnections.delete(userIdStr);
        logger.info(`No remaining sockets for user ${userIdStr}, removed from connections`);
      }
    } else {
      logger.debug(`No sockets found for user ${userIdStr} to delete socket ${socketId}`);
    }
  },
  has(userId) {
    const logger = getLogger();
    logger.debug(`Checking if user has connections: ${userId}`);

    if (!userId || !isValidObjectId(userId)) {
      logger.warn(`Invalid userId for has: ${userId}`);
      return false;
    }

    const userIdStr = typeof userId === "string" ? userId : userId.toString();
    const exists = activeConnections.has(userIdStr);
    logger.debug(`User ${userIdStr} has connections: ${exists}`);
    return exists;
  },
  map: activeConnections,
};

module.exports = { connections };