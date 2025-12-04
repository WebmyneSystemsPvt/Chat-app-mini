const crypto = require("crypto");

function createResponse({ success, statusCode, message, data, errors }) {
  return {
    success,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
    errors,
    c: createMD5Hash(data),
  };
}

function createMD5Hash(input) {
  let rawData = input;

  if (!rawData) rawData = "";

  if (typeof rawData === "object") {
    rawData = JSON.stringify(rawData);
  }

  if (typeof rawData === "function") {
    rawData = null; // TODO : Better Error handling
  }

  rawData = String(rawData);

  rawData = rawData + "hashKeYYY"; // MOVE Key to env

  const hash = crypto.createHash("md5");
  hash.update(rawData);
  return hash.digest("hex");
}

class ResponseFactory {
  static success(data = {}, message = "Success", statusCode = 200) {
    return createResponse({
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static error(
    message = "Something went wrong",
    statusCode = 500,
    errors = []
  ) {
    return createResponse({
      success: false,
      statusCode,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  static validationError(errors = [], message = "Validation failed") {
    return createResponse({
      success: false,
      statusCode: 400,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  static unauthorized(message = "Unauthorized") {
    return createResponse({
      success: false,
      statusCode: 401,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  static notFound(message = "Resource not found") {
    return createResponse({
      success: false,
      statusCode: 404,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = ResponseFactory;
