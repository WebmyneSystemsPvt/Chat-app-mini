const { getLogger } = require("./logger");
const ResponseFactory = require("../lib/Factories/ResponseFactoryAPI");

/**
 * Success response handler
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} JSON response
 */
const successResponse = (
  res,
  data = null,
  message = "Success",
  statusCode = 200
) => {
  const logger = getLogger();
  try {
    if (
      !res ||
      typeof res.status !== "function" ||
      typeof res.json !== "function"
    ) {
      logger.error("Invalid Express response object in successResponse");
      throw new Error("Invalid response object");
    }

    if (typeof message !== "string") {
      logger.warn(`Invalid message type in successResponse: ${typeof message}`);
      message = "Success";
    }

    if (
      typeof statusCode !== "number" ||
      statusCode < 100 ||
      statusCode > 599
    ) {
      logger.warn(`Invalid statusCode in successResponse: ${statusCode}`);
      statusCode = 200;
    }

    logger.debug(
      `Sending success response: ${message} (status: ${statusCode})`
    );
    return res
      .status(statusCode)
      .json(ResponseFactory.success(data, message, statusCode));
  } catch (err) {
    logger.error(`Error in successResponse: ${err.message}`, {
      stack: err.stack,
    });
    throw err;
  }
};

/**
 * Error response handler
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default error message
 * @param {number} defaultStatusCode - Default HTTP status code (default: 500)
 * @returns {Object} JSON response
 */
const errorResponse = (
  res,
  error,
  defaultMessage = "Something went wrong",
  defaultStatusCode = 500
) => {
  const logger = getLogger();
  try {
    if (
      !res ||
      typeof res.status !== "function" ||
      typeof res.json !== "function"
    ) {
      logger.error("Invalid Express response object in errorResponse");
      throw new Error("Invalid response object");
    }

    if (!(error instanceof Error)) {
      logger.warn(`Invalid error object in errorResponse: ${typeof error}`);
      error = new Error(defaultMessage);
    }

    if (typeof defaultMessage !== "string") {
      logger.warn(
        `Invalid defaultMessage type in errorResponse: ${typeof defaultMessage}`
      );
      defaultMessage = "Something went wrong";
    }

    if (
      typeof defaultStatusCode !== "number" ||
      defaultStatusCode < 100 ||
      defaultStatusCode > 599
    ) {
      logger.warn(
        `Invalid defaultStatusCode in errorResponse: ${defaultStatusCode}`
      );
      defaultStatusCode = 500;
    }

    const statusCode = error.statusCode || defaultStatusCode;
    const message = error.message || defaultMessage;

    logger.error(`Error response: ${message} (status: ${statusCode})`, {
      stack: error.stack,
    });

    return res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  } catch (err) {
    logger.error(`Error in errorResponse: ${err.message}`, {
      stack: err.stack,
    });
    throw err;
  }
};

/**
 * Pagination response handler
 * @param {Object} res - Express response object
 * @param {Array} data - Paginated data
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @param {string} message - Success message
 * @returns {Object} JSON response
 */
const paginatedResponse = (
  res,
  data,
  page,
  limit,
  total,
  message = "Success",
  cursor
) => {
  const logger = getLogger();
  try {
    if (
      !res ||
      typeof res.status !== "function" ||
      typeof res.json !== "function"
    ) {
      logger.error("Invalid Express response object in paginatedResponse");
      throw new Error("Invalid response object");
    }

    if (!Array.isArray(data)) {
      logger.warn(`Invalid data type in paginatedResponse: ${typeof data}`);
      data = [];
    }

    if (typeof page !== "number" || page < 1) {
      logger.warn(`Invalid page in paginatedResponse: ${page}`);
      page = 1;
    }

    if (typeof limit !== "number" || limit < 1) {
      logger.warn(`Invalid limit in paginatedResponse: ${limit}`);
      limit = 10;
    }

    if (typeof total !== "number" || total < 0) {
      logger.warn(`Invalid total in paginatedResponse: ${total}`);
      total = 0;
    }

    if (typeof message !== "string") {
      logger.warn(
        `Invalid message type in paginatedResponse: ${typeof message}`
      );
      message = "Success";
    }

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    logger.debug(
      `Sending paginated response: ${message} (page: ${page}, limit: ${limit}, total: ${total})`
    );

    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage,
        hasPreviousPage,
        nextPage: hasNextPage ? page + 1 : null,
        previousPage: hasPreviousPage ? page - 1 : null,
        cursor
      },
    });
  } catch (err) {
    logger.error(`Error in paginatedResponse: ${err.message}`, {
      stack: err.stack,
    });
    throw err;
  }
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};
