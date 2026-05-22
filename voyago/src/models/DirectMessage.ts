import mongoose from "mongoose";

const DirectMessageReactionSchema = new mongoose.Schema(
  {
    emoji: {
      type: String,
      required: true,
      trim: true,
    },
    users: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const DirectMessageEntrySchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    senderEmail: {
      type: String,
      required: true,
      trim: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    deliveredTo: {
      type: [String],
      default: [],
    },
    seenBy: {
      type: [String],
      default: [],
    },
    reactions: {
      type: [DirectMessageReactionSchema],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const DirectMessageSchema = new mongoose.Schema(
  {
    conversationKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    participants: {
      type: [String],
      required: true,
      default: [],
    },
    messages: {
      type: [DirectMessageEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "journeysync_direct_messages",
  }
);

export default mongoose.models.DirectMessage || mongoose.model("DirectMessage", DirectMessageSchema);
