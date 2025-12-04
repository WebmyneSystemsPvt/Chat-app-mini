const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("./errors");
const { getLogger } = require("./logger");
const { isValidObjectId } = require("../sockets/handlers/direct/message");

/**
 * Validates the user ID for JWT operations
 * @param {string|Object} userId - The user ID to validate
 * @returns {string} Validated user ID as string
 * @throws {Error} If userId is invalid
 */
function validateUserId(userId) {
  const logger = getLogger();
  logger.debug(`Validating userId for JWT: ${userId}`);

  if (!userId) {
    logger.warn("No user ID provided for JWT operation");
    throw new Error("No User ID");
  }

  if (typeof userId === "string" && isValidObjectId(userId)) {
    logger.debug(`UserId is valid: ${userId}`);
    return userId;
  }

  if (typeof userId?.toString === "function" && isValidObjectId(userId)) {
    const userIdStr = userId.toString();
    logger.debug(`Converted userId to string: ${userIdStr}`);
    return userIdStr;
  }

  logger.warn(`Invalid userId for JWT: ${userId}`);
  throw new Error("Invalid UserId");
}

/**
 * Generates an access token for the user
 * @param {string|Object} userId - The user ID to encode in the token
 * @returns {string} JWT access token
 * @throws {Error} If token generation fails
 */
const generateAccessToken = (userId) => {
  const logger = getLogger();
  const userIdStr = validateUserId(userId);
  logger.debug(`Generating access token for user: ${userIdStr}`);

  try {
    const token = jwt.sign({ userId: userIdStr }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || "15m",
    });
    logger.info(`Access token generated for user: ${userIdStr}`);
    return token;
  } catch (error) {
    logger.error(
      `Error generating access token for user ${userIdStr}: ${error.message}`,
      {
        stack: error.stack,
      }
    );
    throw new Error("Failed to generate access token");
  }
};

/**
 * Verifies an access token
 * @param {string} token - The JWT access token to verify
 * @returns {Object} Decoded token payload
 * @throws {UnauthorizedError} If token is invalid or expired
 */
const verifyAccessToken = (token) => {
  const logger = getLogger();
  logger.debug(`Verifying access token: ${token?.substring(0, 10)}...`);

  if (!token || typeof token !== "string") {
    logger.warn("Invalid or missing access token");
    throw new UnauthorizedError("Invalid or missing access token");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    logger.debug(`Access token verified for user: ${payload.userId}`);
    return payload;
  } catch (error) {
    logger.warn(`Access token verification failed: ${error.message}`);
    throw new UnauthorizedError("Invalid or expired access token");
  }
};

/**
 * Generates a refresh token for the user
 * @param {string|Object} userId - The user ID to encode in the token
 * @returns {string} JWT refresh token
 * @throws {Error} If token generation fails
 */
const generateRefreshToken = (userId) => {
  const logger = getLogger();
  const userIdStr = validateUserId(userId);
  logger.debug(`Generating refresh token for user: ${userIdStr}`);

  try {
    const token = jwt.sign({ userId: userIdStr }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d",
    });
    logger.info(`Refresh token generated for user: ${userIdStr}`);
    return token;
  } catch (error) {
    logger.error(
      `Error generating refresh token for user ${userIdStr}: ${error.message}`,
      {
        stack: error.stack,
      }
    );
    throw new Error("Failed to generate refresh token");
  }
};

/**
 * Verifies a refresh token
 * @param {string} token - The JWT refresh token to verify
 * @returns {Object} Decoded token payload
 * @throws {UnauthorizedError} If token is invalid or expired
 */
const verifyRefreshToken = (token) => {
  const logger = getLogger();
  logger.debug(`Verifying refresh token: ${token?.substring(0, 10)}...`);

  if (!token || typeof token !== "string") {
    logger.warn("Invalid or missing refresh token");
    throw new UnauthorizedError("Invalid or missing refresh token");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    logger.debug(`Refresh token verified for user: ${payload.userId}`);
    return payload;
  } catch (error) {
    logger.warn(`Refresh token verification failed: ${error.message}`);
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
