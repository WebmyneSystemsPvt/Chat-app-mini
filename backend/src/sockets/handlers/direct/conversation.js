const { default: mongoose } = require("mongoose");
const Conversation = require("../../../models/Conversation");
const {
  CONVERSATION_TYPES,
  CONVERSATION_MEMBER_ROLES,
} = require("../../../utils/constants/conversation");
const { getLogger } = require("../../../utils/logger");
const {
  getConversationByIdService,
  getPopulatedConversation,
} = require("../../../services/conversations");
const { convertToObjectId } = require("../../../utils/db");

module.exports.getConversationByMembersHash = async (membersHash) => {
  const logger = getLogger();
  try {
    logger.debug(`Fetching conversation with membersHash: ${membersHash}`);
    const existingConversation = await getPopulatedConversation({
      type: CONVERSATION_TYPES.DIRECT,
      membersHash: membersHash,
      members: {
        $size: 2,
      },
    });

    if (existingConversation) {
      logger.info(`Found conversation with membersHash: ${membersHash}`);
    } else {
      logger.debug(`No conversation found for membersHash: ${membersHash}`);
    }
    return existingConversation;
  } catch (err) {
    logger.error(
      `Error fetching conversation with membersHash ${membersHash}: ${err.message}`,
      { stack: err.stack }
    );
    throw err;
  }
};

function memberFactoryDM(memberDoc, role) {
  return {
    userId: typeof memberDoc === "string" ? memberDoc : memberDoc._id,
    role: typeof role === "string" ? role : CONVERSATION_MEMBER_ROLES.MEMBER,
  };
}

module.exports.createDirectConversation = async (payload = {}) => {
  const logger = getLogger();
  try {
    const { fromUser, toUser, membersHash, memberIds, requestId } = payload;
    logger.debug(
      `Creating direct conversation between users ${fromUser._id} and ${toUser._id}`
    );

    const newConversation = new Conversation({
      type: CONVERSATION_TYPES.DIRECT,
      name: `${fromUser.username}_${toUser.username}`,
      membersHash: membersHash,
      members: [memberFactoryDM(fromUser), memberFactoryDM(toUser)],
      createdBy: fromUser._id,
      memberIds,
      requestId,
    });

    await newConversation.save();
    const populatedConversation = await newConversation.populate(
      "members.user",
      "_id firstName lastName email"
    );
    logger.info(`Created direct conversation with ID: ${newConversation._id}`);
    return populatedConversation;
  } catch (err) {
    logger.error(`Error creating direct conversation: ${err.message}`, {
      stack: err.stack,
    });
    throw err;
  }
};

module.exports.getConversationById = async (convId, { userId } = {}) => {
  const logger = getLogger();
  try {
    logger.debug(`Fetching conversation with ID: ${convId}`);
    const conversation = await getConversationByIdService(convId, {
      userId,
    });
    if (conversation) {
      logger.info(`Found conversation with ID: ${convId}`);
    } else {
      logger.debug(`No conversation found for ID: ${convId}`);
    }
    return conversation;
  } catch (err) {
    logger.error(
      `Error fetching conversation with ID ${convId}: ${err.message}`,
      {
        stack: err.stack,
      }
    );
    throw err;
  }
};

