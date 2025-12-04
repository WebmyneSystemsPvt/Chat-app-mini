class SocketResponseFactory {
  static success(event, data = {}, message = "Success") {
    return {
      event,
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(event, message = "Error occurred", code = 500, details = {}) {
    return {
      event,
      success: false,
      message,
      code,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  static validationError(event, errors = [], message = "Validation failed") {
    return {
      event,
      success: false,
      message,
      code: 400,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  static broadcast(event, payload = {}, message = "Broadcast message") {
    return {
      event,
      type: "broadcast",
      success: true,
      message,
      payload,
      timestamp: new Date().toISOString(),
    };
  }

  static ack(event, status = "ok", data) {
    return {
      event,
      type: "ack",
      status,
      data,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = SocketResponseFactory;
