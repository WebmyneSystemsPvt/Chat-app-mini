const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const { NotFoundError } = require("../utils/errors");
const { getLogger } = require("../utils/logger");

// Get all users (except current user)
const getUsers = asyncHandler(async (req, res) => {
  const logger = getLogger();
  const users = await User.find({ _id: { $ne: req.user.userId } })
    .select("-password -__v")
    .sort({ online: -1, username: 1 });

  const formattedUsers = users.map((user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    online: user.online,
    lastSeen: user.lastSeen,
  }));

  logger.info(`Fetched all users for current user: ${req.user.userId}`);

  res.json({
    success: true,
    count: formattedUsers.length,
    data: formattedUsers,
  });
});

// Get user by ID
const getUserById = asyncHandler(async (req, res) => {
  const logger = getLogger();
  const user = await User.findById(req.params.id).select("-password -__v");
  if (!user) {
    logger.warn(`User not found: ${req.params.id}`);
    throw new NotFoundError("User not found");
  }

  const responseUser = {
    id: user._id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    online: user.online,
    lastSeen: user.lastSeen,
  };

  logger.debug(`Fetched user by ID: ${req.params.id}`);

  res.json({
    success: true,
    data: responseUser,
  });
});

// Get current user profile
const getProfile = asyncHandler(async (req, res) => {
  const logger = getLogger();
  const user = await User.findById(req.user.userId).select("-password -__v");

  if (!user) {
    logger.warn(`Profile not found for user: ${req.user.userId}`);
    throw new NotFoundError("User not found");
  }

  logger.debug(`Fetched profile for user: ${req.user.userId}`);

  res.json({
    success: true,
    data: user,
  });
});

module.exports = {
  getUsers,
  getUserById,
  getProfile,
};
