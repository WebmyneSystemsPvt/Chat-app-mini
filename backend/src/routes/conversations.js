const router = require("express").Router();
const { check } = require("express-validator");
const conversationController = require("../controllers/conversations");

router.get("/", conversationController.getUserConversations);

router.get(
  "/:conversationId",
  [
    check("conversationId", "Valid conversationId is required").isMongoId(),
    check("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive number"),
    check("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
  ],
  conversationController.getUserConversationMessages
);

module.exports = router;
