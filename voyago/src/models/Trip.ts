import mongoose from "mongoose";

const TripMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const TripMessageSchema = new mongoose.Schema(
  {
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    senderEmail: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const TripSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Trip name is required"],
      trim: true,
    },
    userEmail: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    tripDay: {
      type: Date,
      required: [true, "Trip date is required"],
    },
    hour: {
      type: String,
      required: [true, "Trip hour is required"],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    numberOfPeople: {
      type: Number,
      required: [true, "Group limit is required"],
      min: [1, "The group limit must be at least 1"],
    },
    status: {
      type: String,
      enum: ["Done", "In Progress", "Cancelled"],
      required: [true, "Status is required"],
      default: "In Progress",
    },
    visibility: {
      type: String,
      enum: ["Public", "Private"],
      required: [true, "Visibility is required"],
      default: "Public",
    },
    members: {
      type: [TripMemberSchema],
      default: [],
    },
    chatMessages: {
      type: [TripMessageSchema],
      default: [],
    },
    inviteCode: {
      type: String,
      trim: true,
      default: "",
    },
    dashboardTheme: {
      type: String,
      enum: ["sunset", "forest", "ocean", "midnight"],
      default: "forest",
    },
    dashboardContent: {
      heroTitle: {
        type: String,
        trim: true,
        default: "",
      },
      heroDescription: {
        type: String,
        trim: true,
        default: "",
      },
      highlights: {
        type: [String],
        default: [],
      },
      hostNotes: {
        type: String,
        trim: true,
        default: "",
      },
    },
  },
  {
    timestamps: true,
    collection: "journeysync_trips",
  }
);

export default mongoose.models.Trip || mongoose.model("Trip", TripSchema);
