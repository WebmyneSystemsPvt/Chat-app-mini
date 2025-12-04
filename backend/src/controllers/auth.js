const asyncHandler = require("express-async-handler");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const {
  registerUserService,
  loginUserService,
  getCurrentUserService,
  logoutUserService,
} = require("../services/auth");

exports.register = asyncHandler(async (req, res) => {
  try {
    const { user, token } = await registerUserService(req.body);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return successResponse(
      res,
      {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token,
      },
      "User registered successfully",
      201
    );
  } catch (error) {
    return errorResponse(res, error);
  }
});

exports.login = asyncHandler(async (req, res) => {
  try {
    const { user, token } = await loginUserService(req.body);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return successResponse(
      res,
      {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token,
      },
      "Logged in successfully"
    );
  } catch (error) {
    return errorResponse(res, error);
  }
});

exports.getMe = asyncHandler(async (req, res) => {
  try {
    const user = await getCurrentUserService(req.user.userId);

    return successResponse(
      res,
      {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        online: user.online,
        lastSeen: user.lastSeen,
      },
      "User fetched successfully"
    );
  } catch (error) {
    return errorResponse(res, error);
  }
});

exports.logout = asyncHandler(async (req, res) => {
  try {
    await logoutUserService(req.user.userId);

    res.clearCookie("token");

    return successResponse(res, null, "Logged out successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
});
