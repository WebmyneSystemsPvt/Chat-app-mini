const { generatePersonalRoomName } = require("../sockets/helpers/room");
const { CONVERSATION_EVENTS } = require("./constants/ioEvents");
const { getLogger } = require("./logger");
const { isValidObjectId } = require("../sockets/handlers/direct/helpers");

function getUserIdStr(userId) {
  const logger = getLogger();
  logger.debug(`Converting userId to string: ${userId}`);

  if (!userId) {
    logger.warn("No user ID provided");
    throw new Error("No User ID");
  }

  if (typeof userId?.toString === "function" && isValidObjectId(userId)) {
    const userIdStr = userId.toString();
    logger.debug(`Converted userId to string: ${userIdStr}`);
    return userIdStr;
  }

  if (typeof userId === "string" && isValidObjectId(userId)) {
    logger.debug(`UserId is already a valid string: ${userId}`);
    return userId;
  }

  logger.warn(`Invalid userId: ${userId}`);
  throw new Error("Invalid UserId");
}

function createDMMembersHash(userId1, userId2) {
  const logger = getLogger();
  logger.debug(
    `Creating DM members hash for userId1: ${userId1}, userId2: ${userId2}`
  );

  const ids = [getUserIdStr(userId1), getUserIdStr(userId2)].sort();
  const hash = ids.join("_");
  logger.debug(`Generated DM members hash: ${hash}`);
  return hash;
}

module.exports = {
  getUserIdStr,
  createDMMembersHash,
};
