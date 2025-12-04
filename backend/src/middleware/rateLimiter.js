const rateLimit = require("express-rate-limit");
const { TooManyRequestsError } = require("../utils/errors");
const { getLogger } = require("../utils/logger");

// Rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 20, // Limit each IP to 20 requests per windowMs
  message: "Too many login attempts, please try again after 15 minutes",
  handler: (req, res, next, options) => {
    const logger = getLogger();
    logger.warn(`Rate limit exceeded for IP: ${req.ip} on auth routes`);
    throw new TooManyRequestsError(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later",
  handler: (req, res, next, options) => {
    const logger = getLogger();
    logger.warn(`Rate limit exceeded for IP: ${req.ip} on API routes`);
    throw new TooManyRequestsError(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});


module.exports = {
  authLimiter,
  apiLimiter,
};
