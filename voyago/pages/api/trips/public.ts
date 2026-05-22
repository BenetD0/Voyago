import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../src/lib/db";
import Trip from "../../../src/models/Trip";

export default async function getPublicTrips(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const trips = await Trip.find({ visibility: "Public" }).sort({ createdAt: -1 }).lean();
    const publicTrips = trips.map((trip: { _id: unknown; members?: unknown[] }) => ({
      ...trip,
      _id: String(trip._id),
      joinedCount: Array.isArray(trip.members) ? trip.members.length : 0,
    }));

    return res.status(200).json(publicTrips);
  } catch (error) {
    console.error("Error fetching public trips:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
