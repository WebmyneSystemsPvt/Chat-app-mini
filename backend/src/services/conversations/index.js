const mongoose = require("mongoose");
const Conversation = require("../../models/Conversation");
const { convertToObjectId } = require("../../utils/db");
const { Message } = require("../../models/Message");

exports.getUserConversationsService = (
  userId,
  { limit = 50, cursor, skip } = {}
) => {
  const match = {
    memberIds: new mongoose.Types.ObjectId(userId),
    archived: false,
  };

  return Conversation.find(match)
    .populate("members.user", "_id firstName lastName email") // populate user details
    .lean();
};

exports.getConversationMessagesService = async (
  userId,
  conversationId,
  { limit = 20, page = 1 } = {}
) => {
  const userObjId = convertToObjectId(userId);
  const convObjId = convertToObjectId(conversationId);

  const match = {
    conversationId: convObjId,
    deletedFor: { $ne: userObjId },
    isDeleted: { $ne: true },
  };

  limit = Math.max(1, Math.min(parseInt(limit, 10) || 20, 50));
  page = Math.max(1, parseInt(page, 10) || 1);

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Message.find(match)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "username firstName lastName email")
      .populate("recipient", "username firstName lastName email")
      .populate("replyTo")
      .lean()
      .exec(),
    Message.countDocuments(match),
  ]);

  const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    messages,
    total,
    page,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
};

const getPopulatedConversation = async (query) => {
  return Conversation.findOne(query).populate(
    "members.user",
    "_id firstName lastName email"
  );
};

exports.getPopulatedConversation = getPopulatedConversation;

exports.getConversationByIdService = async (
  conversationId,
  { userId } = {}
) => {
  return getPopulatedConversation({
    _id: conversationId,
    memberIds: { $in: [convertToObjectId(userId)] },
  });
};
