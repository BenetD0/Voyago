import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["trip_join", "trip_invite", "friend_request", "friend_accept", "direct_message", "system"],
      default: "system",
    },
    read: {
      type: Boolean,
      default: false,
    },
    data: {
      tripId: { type: String, default: "" },
      inviteCode: { type: String, default: "" },
      friendEmail: { type: String, default: "" },
      senderEmail: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
    collection: "journeysync_notifications",
  }
);

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
