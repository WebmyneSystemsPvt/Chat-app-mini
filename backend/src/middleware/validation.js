const { validationResult } = require("express-validator");
const { BadRequestError } = require("../utils/errors");
const { getLogger } = require("../utils/logger");

const validate = (req, res, next) => {
  const logger = getLogger();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessage = errors.array()[0].msg;
    logger.warn(`Validation failed: ${errorMessage}`);
    throw new BadRequestError(errorMessage);
  }
  logger.debug("Request validation passed");
  next();
};

module.exports = { validate };