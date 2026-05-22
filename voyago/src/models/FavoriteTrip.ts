import mongoose from "mongoose";

const FavoriteTripSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "journeysync_favorite_trips",
  }
);

FavoriteTripSchema.index({ userEmail: 1, tripId: 1 }, { unique: true });

export default mongoose.models.FavoriteTrip || mongoose.model("FavoriteTrip", FavoriteTripSchema);
