const User = require("../../../models/User");
const { BadRequestError, NotFoundError } = require("../../../utils/errors");
const { getLogger } = require("../../../utils/logger");

function registerUserProfileHandlers(io, socket) {
  const logger = getLogger();
  const userIdStr = socket.user._id.toString();

  // Update user profile
  socket.on("user:updateProfile", async (updates, callback) => {
    try {
      logger.debug(`User ${userIdStr} attempting to update profile`);

      const { username, email, firstName, lastName } = updates || {};
      const updateFields = {};

      // Only allow updating specific fields
      if (username) {
        updateFields.username = username.trim();
        logger.debug(`Updating username to: ${updateFields.username}`);
      }
      if (email) {
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser && existingUser._id.toString() !== userIdStr) {
          logger.warn(`Email already in use: ${normalizedEmail}`);
          throw new BadRequestError("Email already in use");
        }
        updateFields.email = normalizedEmail;
        logger.debug(`Updating email to: ${normalizedEmail}`);
      }
      if (firstName !== undefined) {
        updateFields.firstName = firstName.trim();
        logger.debug(`Updating firstName to: ${updateFields.firstName}`);
      }
      if (lastName !== undefined) {
        updateFields.lastName = lastName.trim();
        logger.debug(`Updating lastName to: ${updateFields.lastName}`);
      }

      // Only update if there are changes
      if (Object.keys(updateFields).length === 0) {
        logger.warn(
          `No valid fields provided for profile update by user ${userIdStr}`
        );
        throw new BadRequestError("No valid fields to update");
      }

      const user = await User.findByIdAndUpdate(
        userIdStr,
        { $set: updateFields },
        { new: true, runValidators: true }
      )
        .select("-password -__v")
        .lean();

      if (!user) {
        logger.warn(`User not found: ${userIdStr}`);
        throw new NotFoundError("User not found");
      }

      // Format the response
      const userResponse = {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        online: user.online,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      socket.broadcast.emit("user:profileUpdated", userResponse);
      logger.info(`User ${userIdStr} profile updated successfully`);

      callback?.({ success: true, data: userResponse });
    } catch (error) {
      logger.error(
        `Error updating profile for user ${userIdStr}: ${error.message}`,
        {
          stack: error.stack,
        }
      );
      callback?.({
        success: false,
        error: error.message || "Failed to update profile",
      });
    }
  });
}

module.exports = { registerUserProfileHandlers };
