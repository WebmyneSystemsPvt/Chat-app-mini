const { registerMessageHandlers } = require("./messageHandlers");
const { getLogger } = require("../../../utils/logger");

function registerDirectHandlers(io, socket) {
  const logger = getLogger();
  logger.debug(
    `Registering direct handlers for socket user: ${socket.user._id}`
  );
  registerMessageHandlers(io, socket);
  logger.info(`Direct handlers registered for user: ${socket.user._id}`);
}

module.exports = { registerDirectHandlers };
