const { getLogger } = require("../../utils/logger");
const Conversation = require("../../models/Conversation");

const logger = getLogger();

const generatePersonalRoomName = (userId) => `user_${userId}`;

const getRoomName = (conversationId) => `conversation_${conversationId}`;

const getConversationParticipants = async (conversationId) => {
  try {
    const conversation = await Conversation.findById(conversationId).select('members.userId -_id');
    if (!conversation) {
      logger.warn(`Conversation not found: ${conversationId}`);
      return [];
    }
    return conversation.members.map(member => member.userId.toString());
  } catch (error) {
    logger.error(`Error fetching conversation participants: ${error.message}`, {
      error,
      conversationId
    });
    return [];
  }
};

const joinPersonalRoom = (socket, userIdStr) => {
  socket.join(generatePersonalRoomName(userIdStr));
};

module.exports = {
  generatePersonalRoomName,
  getRoomName,
  getConversationParticipants,
  joinPersonalRoom
};
