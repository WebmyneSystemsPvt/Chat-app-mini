const { validationResult } = require("express-validator");
const conversationService = require("../services/conversations");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/apiResponse");
const { Message } = require("../models/Message");
const Conversation = require("../models/Conversation");
const { getLogger } = require("../utils/logger");
const { convertToObjectId } = require("../utils/db");

exports.getUserConversations = async (req, res) => {
  const logger = getLogger();
  const userId = req.user?.userId;
  let cursor;
  const updatedAtQuery = req.query.updatedAt;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = req.query.limit;
  const skip = (page - 1) * limit;

  if (updatedAtQuery) {
    const parsedUpdatedAt = new Date(updatedAtQuery);
    if (!isNaN(parsedUpdatedAt.getTime())) {
      cursor = { updatedAt: parsedUpdatedAt.toISOString() };
    }
  }

  const conversations = await conversationService.getUserConversationsService(
    userId,
    { skip, limit, cursor }
  );

  logger.info(`Fetched conversations for user: ${userId}`);

  return successResponse(res, conversations);
};

exports.getUserConversationMessages = async (req, res) => {
  const logger = getLogger();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(
        res,
        new Error("Validation failed"),
        "Invalid request parameters",
        400
      );
    }

    const { conversationId } = req.params;
    const currentUser = req.user.userId;

    const conversation = await Conversation.findOne({
      _id: convertToObjectId(conversationId),
      memberIds: { $in: [convertToObjectId(currentUser)] },
    }).lean();

    if (!conversation) {
      return errorResponse(
        res,
        new Error("Conversation not found"),
        "Conversation not found for user",
        404
      );
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    const {
      messages,
      total,
      page: returnedPage,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    } = await conversationService.getConversationMessagesService(
      currentUser,
      conversationId,
      {
        limit,
        page,
      }
    );

    logger.info(
      `Fetched conversation messages (${conversationId}) for ${currentUser} (page ${returnedPage})`
    );

    return paginatedResponse(
      res,
      messages,
      returnedPage,
      limit,
      total,
      `Conversation messages(${conversationId}) for ${currentUser} fetched successfully`,
      { totalPages, hasNextPage, hasPreviousPage }
    );
  } catch (error) {
    logger.error(`Error fetching conversation messages: ${error.message}`);
    return errorResponse(res, error, "Failed to fetch conversation messages");
  }
};
