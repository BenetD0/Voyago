import mongoose from "mongoose";

const FriendshipSchema = new mongoose.Schema(
  {
    requesterEmail: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    recipientEmail: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
    tripId: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "journeysync_friendships",
  }
);

FriendshipSchema.index({ requesterEmail: 1, recipientEmail: 1 }, { unique: true });

export default mongoose.models.Friendship || mongoose.model("Friendship", FriendshipSchema);
