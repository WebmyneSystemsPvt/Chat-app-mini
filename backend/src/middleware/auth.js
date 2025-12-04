const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { UnauthorizedError } = require("../utils/errors");
const { getLogger } = require("../utils/logger");

const auth = async (req, res, next) => {
  const logger = getLogger();
  try {
    let token;

    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
      logger.debug("Authentication token found in Authorization header");
    }
    // If no token in header, check cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
      logger.debug("Authentication token found in cookies");
    }

    if (!token) {
      logger.warn("No authentication token provided in request");
      return next(new UnauthorizedError("No authentication token provided"));
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      logger.debug(`JWT verified for userId: ${payload.userId}`);

      // Verify the user exists
      const user = await User.findById(payload.userId).select("-password");
      if (!user) {
        logger.warn(`User not found for userId: ${payload.userId}`);
        return next(new UnauthorizedError("User not found"));
      }

      // Attach the user to the request object
      req.user = { userId: payload.userId };
      logger.info(`Authenticated user: ${payload.userId}`);
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        logger.warn(`Invalid token: ${error.message}`);
        return next(new UnauthorizedError("Invalid token"));
      }
      if (error.name === "TokenExpiredError") {
        logger.warn(`Token expired: ${error.message}`);
        return next(new UnauthorizedError("Token expired"));
      }
      logger.error(`Authentication failed: ${error.message}`);
      return next(new UnauthorizedError("Authentication failed"));
    }
  } catch (error) {
    logger.error(`Unexpected error in auth middleware: ${error.message}`);
    return next(error);
  }
};

const socketAuth = async (socket, next) => {
  const logger = getLogger();
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      logger.warn("No authentication token provided in socket connection");
      return next(new Error("Authentication error: No token provided"));
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    logger.debug(`Socket JWT verified for userId: ${payload.userId}`);

    const user = await User.findById(payload.userId);
    if (!user) {
      logger.warn(`User not found for socket connection: ${payload.userId}`);
      return next(new Error("Authentication error: User not found"));
    }

    // Attach user to socket
    socket.user = user;
    logger.info(`Socket authenticated for user: ${payload.userId}`);
    next();
  } catch (error) {
    logger.error(`Socket authentication error: ${error.message}`);
    next(new Error("Authentication error"));
  }
};

module.exports = { auth, socketAuth };