const { getLogger } = require("../../utils/logger");
const { connections } = require("../store");

const logger = getLogger();

const userRooms = new Map();
const roomUsers = new Map();

const joinRoom = (userId, roomName, io) => {
  try {
    if (!userId || !roomName) {
      logger.warn(`Invalid userId or roomName: ${userId}, ${roomName}`);
      return false;
    }

    const userIdStr = userId.toString();

    if (userRooms.has(userIdStr) && userRooms.get(userIdStr).has(roomName)) {
      logger.debug(`User ${userIdStr} already joined room ${roomName}`);
      return true;
    }

    const userSockets = connections.get(userIdStr);

    if (!userRooms.has(userIdStr)) {
      userRooms.set(userIdStr, new Set());
    }

    if (!roomUsers.has(roomName)) {
      roomUsers.set(roomName, new Set());
    }

    roomUsers.get(roomName).add(userIdStr);
    userRooms.get(userIdStr).add(roomName);

    if (userSockets && userSockets.size > 0) {
      userSockets.forEach((socketId) => {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
          socket.join(roomName);
          logger.debug(`Socket ${socketId} joined room ${roomName}`);
        }
      });
    } else {
      logger.debug(
        `No active sockets for user ${userIdStr}, but added to room maps for future reconnect`
      );
    }

    logger.info(`User ${userIdStr} joined room ${roomName}`, {
      roomUserCount: roomUsers.get(roomName).size,
    });
    return true;
  } catch (error) {
    logger.error(`Error joining room: ${error.message}`, {
      error,
      userId,
      roomName,
    });
    return false;
  }
};

const leaveRoom = (userId, roomName, io) => {
  try {
    if (!userId || !roomName) {
      logger.warn(`Invalid userId or roomName: ${userId}, ${roomName}`);
      return false;
    }

    const userIdStr = userId.toString();

    if (userRooms.has(userIdStr)) {
      userRooms.get(userIdStr).delete(roomName);

      if (userRooms.get(userIdStr).size === 0) {
        userRooms.delete(userIdStr);
      }
    }

    if (roomUsers.has(roomName)) {
      roomUsers.get(roomName).delete(userIdStr);

      if (roomUsers.get(roomName).size === 0) {
        roomUsers.delete(roomName);
      }
    }

    const userSockets = connections.get(userIdStr);
    if (userSockets) {
      userSockets.forEach((socketId) => {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
          socket.leave(roomName);
          logger.debug(`Socket ${socketId} left room ${roomName}`);
        }
      });
    }

    logger.info(`User ${userIdStr} left room ${roomName}`, {
      remainingUsers: roomUsers.get(roomName)?.size || 0,
    });
    return true;
  } catch (error) {
    logger.error(`Error leaving room: ${error.message}`, {
      error,
      userId,
      roomName,
    });
    return false;
  }
};

const handleReconnect = (userId, socketId, io) => {
  try {
    const userIdStr = userId.toString();
    const rooms = userRooms.get(userIdStr) || new Set();
    const socket = io.sockets.sockets.get(socketId);

    if (!socket) {
      logger.warn(`Socket ${socketId} not found for user ${userIdStr}`);
      return false;
    }

    rooms.forEach((room) => {
      socket.join(room);
      logger.debug(`Socket ${socketId} rejoined room ${room} on reconnect`);
    });

    logger.info(`User ${userIdStr} rejoined ${rooms.size} rooms on reconnect`);
    return true;
  } catch (error) {
    logger.error(`Error handling reconnect: ${error.message}`, {
      error,
      userId,
      socketId,
    });
    return false;
  }
};

const getUserRooms = (userId) => {
  const userRoomsSet = userRooms.get(userId.toString()) || new Set();
  return Array.from(userRoomsSet);
};

const getRoomUsers = (roomName) => {
  const users = roomUsers.get(roomName) || new Set();
  return Array.from(users);
};

module.exports = {
  joinRoom,
  leaveRoom,
  handleReconnect,
  getUserRooms,
  getRoomUsers,
};
