const express = require("express");
const { check } = require("express-validator");
const userController = require("../controllers/user");
const { validate } = require("../middleware/validation");
const { auth } = require("../middleware/auth"); // Import upload middleware

const router = express.Router();

// Get current user profile
router.get("/profile", auth, userController.getProfile);

// Get all users (except current user)
router.get("/", auth, userController.getUsers);

// Get user by ID
router.get("/:id", auth, userController.getUserById);

module.exports = router;
