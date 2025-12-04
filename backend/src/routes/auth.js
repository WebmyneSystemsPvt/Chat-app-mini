const express = require("express");
const { check } = require("express-validator");
const authController = require("../controllers/auth");
const { validate } = require("../middleware/validation");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/register",
  [
    check("username").notEmpty().withMessage("Username is required"),
    check("email").isEmail().withMessage("Please include a valid email"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  authController.register
);

router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Please include a valid email"),
    check("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  authController.login
);

router.get("/me", auth, authController.getMe);

router.post("/logout", auth, authController.logout);

module.exports = router;
