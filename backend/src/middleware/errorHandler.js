const { CustomAPIError } = require("../utils/errors");
const { getLogger } = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  const logger = getLogger();

  // Log the error with stack trace for debugging
  logger.error(`Error occurred: ${err.message}`, { stack: err.stack });

  if (err instanceof CustomAPIError) {
    logger.debug(
      `Handling CustomAPIError: ${err.message}, Status: ${err.statusCode}`
    );
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    logger.warn(`JWT error: Invalid token`);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    logger.warn(`Validation error: ${messages.join(", ")}`);
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: messages,
    });
  }

  // Default error
  logger.error(`Unhandled error: ${err.message}`);
  return res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again later.",
  });
};

module.exports = { errorHandler };
