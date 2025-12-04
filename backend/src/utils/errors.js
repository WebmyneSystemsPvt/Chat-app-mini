const { getLogger } = require("./logger");

class CustomAPIError extends Error {
  constructor(message, statusCode) {
    super(message);
    const logger = getLogger();
    this.statusCode = statusCode || 500;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);

    logger.error(`[${this.name}] ${message}`, {
      statusCode: this.statusCode,
      stack: this.stack,
    });
  }
}

class BadRequestError extends CustomAPIError {
  constructor(message = "Bad Request", details = null) {
    super(message, 400);
    this.details = details; // Optional details for validation errors
  }
}

class UnauthorizedError extends CustomAPIError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

class ForbiddenError extends CustomAPIError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

class NotFoundError extends CustomAPIError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

class ConflictError extends CustomAPIError {
  constructor(message = "Resource already exists") {
    super(message, 409);
  }
}

class TooManyRequestsError extends CustomAPIError {
  constructor(message = "Too many requests, please try again later") {
    super(message, 429);
  }
}

module.exports = {
  CustomAPIError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
};
