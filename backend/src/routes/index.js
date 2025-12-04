const router = require("express").Router();

const { auth } = require("../middleware/auth");

const authRoutes = require("./auth");
const userRoutes = require("./users");
const conversationRoutes = require("./conversations");
const { authLimiter } = require("../middleware/rateLimiter");

router.use("/api/auth", authLimiter, authRoutes);
router.use("/api/users", auth, userRoutes);
router.use("/api/conversations", auth, conversationRoutes);

router.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
    error: {
      code: 404,
      message: `Cannot ${req.method} ${req.path}`,
    },
  });
});

module.exports = router;
