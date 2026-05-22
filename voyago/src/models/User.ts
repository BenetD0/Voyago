import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    bio: { type: String, default: "" },
    city: { type: String, default: "" },
    travelStyle: { type: String, default: "" },
    avatarColor: { type: String, default: "#22C55E" },
    refreshTokens: [
      {
        tokenHash: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    collection: "journeysync_users",
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
