import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuth } from "../../../src/lib/auth";
import dbConnect from "../../../src/lib/db";
import Trip from "../../../src/models/Trip";

export default async function joinedTrips(req: NextApiRequest, res: NextApiResponse) {
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
    const trips = await Trip.find({ "members.email": token.email })
      .select("name destination visibility tripDay")
      .sort({ tripDay: 1 })
      .lean();

    return res.status(200).json(
      trips.map((trip: { _id: unknown; name?: string; destination?: string; visibility?: string; tripDay?: string }) => ({
        _id: String(trip._id),
        name: trip.name || trip.destination,
        destination: trip.destination,
        visibility: trip.visibility,
        tripDay: trip.tripDay,
      }))
    );
  } catch (error) {
    console.error("Error fetching joined trips:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
