const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
} = require("../../utils/errors");
const { getLogger } = require("../../utils/logger");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

exports.registerUserService = async (payload) => {
  const logger = getLogger();
  const { username, email, password, firstName, lastName } = payload;

  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser)
    throw new ConflictError("User already exists with this email");

  // Create user
  const user = new User({
    username,
    email,
    password,
    firstName,
    lastName,
  });

  await user.save();
  logger.info(`User registered successfully: ${user.email}`);

  const token = generateToken(user._id);

  return { user, token };
};

exports.loginUserService = async (payload) => {
  const logger = getLogger();
  const { email, password } = payload;

  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new UnauthorizedError("Invalid credentials");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new UnauthorizedError("Invalid credentials");

  user.online = true;
  await user.save();

  const token = generateToken(user._id);
  logger.info(`User logged in successfully: ${email}`);

  return { user, token };
};

exports.getCurrentUserService = async (userId) => {
  const user = await User.findById(userId).select("-password -__v");
  if (!user) throw new UnauthorizedError("User not found");
  return user;
};

exports.logoutUserService = async (userId) => {
  await User.findByIdAndUpdate(userId, { online: false });
  return true;
};
