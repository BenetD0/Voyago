import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuth } from "../../../src/lib/auth";
import dbConnect from "../../../src/lib/db";
import FavoriteTrip from "../../../src/models/FavoriteTrip";
import Trip from "../../../src/models/Trip";

export default async function favorites(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = await getRequestAuth(req);
    if (!token?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await dbConnect();

    if (req.method === "GET") {
      const favoriteDocs = await FavoriteTrip.find({ userEmail: token.email }).sort({ createdAt: -1 }).lean();
      const tripIds = favoriteDocs.map((favorite: { tripId: string }) => favorite.tripId);
      const trips = await Trip.find({ _id: { $in: tripIds } }).lean();
      const tripsById = new Map(
        trips.map((trip: { _id: unknown; members?: { email: string }[] }) => [String(trip._id), trip])
      );

      const items = favoriteDocs
        .map((favorite: { _id: unknown; tripId: string }) => {
          const trip = tripsById.get(String(favorite.tripId));
          if (!trip) return null;

          return {
            _id: String(favorite._id),
            tripId: String(favorite.tripId),
            trip: {
              ...trip,
              _id: String(trip._id),
              joinedCount: Array.isArray(trip.members) ? trip.members.length : 0,
              isFavorite: true,
              isJoined: Array.isArray(trip.members)
                ? trip.members.some((member: { email: string }) => member.email === token.email)
                : false,
            },
          };
        })
        .filter(Boolean);

      return res.status(200).json(items);
    }

    if (req.method === "POST") {
      const { tripId } = req.body;
      if (!tripId) {
        return res.status(400).json({ message: "Trip id is required" });
      }

      const trip = await Trip.findById(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }

      const favorite = await FavoriteTrip.findOneAndUpdate(
        { userEmail: token.email, tripId },
        { userEmail: token.email, tripId },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return res.status(200).json({ message: "Trip saved to favorites", favoriteId: String(favorite._id) });
    }

    if (req.method === "DELETE") {
      const tripId = typeof req.query.tripId === "string" ? req.query.tripId : "";
      if (!tripId) {
        return res.status(400).json({ message: "Trip id is required" });
      }

      await FavoriteTrip.findOneAndDelete({ userEmail: token.email, tripId });
      return res.status(200).json({ message: "Trip removed from favorites" });
    }

    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Error handling favorites:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
