const mongoose = require("mongoose");

const {
  CONVERSATION_MEMBER_ROLES,
  CONVERSATION_TYPES,
} = require("../utils/constants/conversation");

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(CONVERSATION_MEMBER_ROLES),
      default: CONVERSATION_MEMBER_ROLES.MEMBER,
    },
    joinedAt: { type: Date, default: Date.now },
    lastReadAt: { type: Date },
  },
  { _id: false, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

memberSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(CONVERSATION_TYPES),
      required: true,
    },
    name: { type: String },
    members: { type: [memberSchema], required: true },
    memberIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    ], // duplicate of members[].userId, but indexed
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    archived: { type: Boolean, default: false },
    membersHash: { type: String, default: null }, // ONLY FOR DIRECT MESSAGES
    lastMessage: {
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String },
      createdAt: { type: Date },
      messageType: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ "members.userId": 1, createdAt: -1 });
conversationSchema.index({ "lastMessage.createdAt": -1 });
conversationSchema.index({ memberIds: 1, "lastMessage.createdAt": -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
