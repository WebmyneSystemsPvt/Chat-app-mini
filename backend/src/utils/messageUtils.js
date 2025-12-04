const { getLogger } = require("./logger");
const { isValidObjectId } = require("../sockets/handlers/direct/helpers");

function validateUserId(userId) {
  const logger = getLogger();
  logger.debug(`Validating userId: ${userId}`);

  if (!userId || !isValidObjectId(userId)) {
    logger.warn(`Invalid userId: ${userId}`);
    throw new Error("Invalid user ID");
  }

  const userIdStr = typeof userId === "string" ? userId : userId.toString();
  logger.debug(`Validated userId: ${userIdStr}`);
  return userIdStr;
}

module.exports = {
  validateUserId,
};
