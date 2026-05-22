import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuth } from "../../../../src/lib/auth";
import dbConnect from "../../../../src/lib/db";
import FavoriteTrip from "../../../../src/models/FavoriteTrip";
import Trip from "../../../../src/models/Trip";

export default async function getAllTrips(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = await getRequestAuth(req);
    if (!token?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await dbConnect();

    const isAdmin = (token as { role?: string }).role === "admin";

    const query = isAdmin
      ? {}
      : {
          $or: [{ visibility: "Public" }, { userEmail: token.email }, { "members.email": token.email }],
        };

    const [trips, favoriteDocs] = await Promise.all([
      Trip.find(query).sort({ createdAt: -1 }).lean(),
      FavoriteTrip.find({ userEmail: token.email }).lean(),
    ]);

    const favoriteTripIds = new Set(favoriteDocs.map((favorite: { tripId: string }) => String(favorite.tripId)));

    const decoratedTrips = trips.map((trip: { _id: unknown; members?: { email: string }[] }) => ({
      ...trip,
      _id: String(trip._id),
      isFavorite: favoriteTripIds.has(String(trip._id)),
      isJoined: Array.isArray(trip.members) ? trip.members.some((member: { email: string }) => member.email === token.email) : false,
      joinedCount: Array.isArray(trip.members) ? trip.members.length : 0,
    }));

    return res.status(200).json(decoratedTrips);
  } catch (error) {
    console.error("Error fetching all trips:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
