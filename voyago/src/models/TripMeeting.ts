import mongoose from "mongoose";

const MeetingParticipantSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const MeetingSignalSchema = new mongoose.Schema(
  {
    signalId: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    from: {
      type: String,
      required: true,
      trim: true,
    },
    to: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["offer", "answer", "candidate"],
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    deliveredTo: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const TripMeetingSchema = new mongoose.Schema(
  {
    tripId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    hostEmail: {
      type: String,
      required: true,
      trim: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
    participants: {
      type: [MeetingParticipantSchema],
      default: [],
    },
    signals: {
      type: [MeetingSignalSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "journeysync_trip_meetings",
  }
);

export default mongoose.models.TripMeeting || mongoose.model("TripMeeting", TripMeetingSchema);
