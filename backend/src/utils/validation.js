const { validationResult } = require("express-validator");
const { BadRequestError } = require("../utils/errors");
const { getLogger } = require("../utils/logger");

const validateRequest = (req, res, next) => {
  const logger = getLogger();
  logger.debug(`Validating request: ${req.method} ${req.originalUrl}`);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.param,
      message: error.msg,
    }));
    logger.warn(
      `Validation failed for ${req.method} ${req.originalUrl}: ${JSON.stringify(errorMessages)}`
    );
    throw new BadRequestError("Validation failed", errorMessages);
  }

  logger.debug(
    `Request validation passed for ${req.method} ${req.originalUrl}`
  );
  next();
};

const validateField = (value, schema) => {
  const logger = getLogger();
  logger.debug(`Validating field value: ${JSON.stringify(value)}`);

  const { error } = schema.validate(value);
  if (error) {
    logger.warn(`Field validation failed: ${error.details[0].message}`);
    return {
      isValid: false,
      error: error.details[0].message,
    };
  }

  logger.debug(`Field validation passed for value: ${JSON.stringify(value)}`);
  return { isValid: true, error: null };
};

const sanitizeInput = (input) => {
  const logger = getLogger();

  if (typeof input === "string") {
    logger.debug(`Sanitizing string input: ${input}`);
    const sanitized = input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
    logger.debug(`Sanitized string to: ${sanitized}`);
    return sanitized;
  }

  if (Array.isArray(input)) {
    logger.debug("Sanitizing array input");
    return input.map((item) => sanitizeInput(item));
  }

  if (typeof input === "object" && input !== null) {
    logger.debug("Sanitizing object input");
    const sanitizedObject = {};
    Object.keys(input).forEach((key) => {
      sanitizedObject[key] = sanitizeInput(input[key]);
    });
    return sanitizedObject;
  }

  logger.debug(
    `Input not sanitized (non-string/array/object): ${JSON.stringify(input)}`
  );
  return input;
};

const sanitizeRequest = (req, res, next) => {
  const logger = getLogger();
  logger.debug(`Sanitizing request: ${req.method} ${req.originalUrl}`);

  // Sanitize request body
  if (req.body) {
    logger.debug("Sanitizing request body");
    req.body = sanitizeInput(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    logger.debug("Sanitizing query parameters");
    req.query = sanitizeInput(req.query);
  }

  // Sanitize route parameters
  if (req.params) {
    logger.debug("Sanitizing route parameters");
    req.params = sanitizeInput(req.params);
  }

  logger.debug(
    `Request sanitization completed for ${req.method} ${req.originalUrl}`
  );
  next();
};

module.exports = {
  validateRequest,
  validateField,
  sanitizeInput,
  sanitizeRequest,
};
