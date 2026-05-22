import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuth } from "../../../../src/lib/auth";
import dbConnect from "../../../../src/lib/db";
import Contact from "../../../../src/models/Contact";
import FavoriteTrip from "../../../../src/models/FavoriteTrip";
import Trip from "../../../../src/models/Trip";
import User from "../../../../src/models/User";

export default async function adminOverview(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = await getRequestAuth(req);

    if (!token || (token as { role?: string }).role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    await dbConnect();

    const [users, trips, contacts, favoriteCount] = await Promise.all([
      User.find({}, "-password").sort({ createdAt: -1 }).lean(),
      Trip.find({}).sort({ createdAt: -1 }).lean(),
      Contact.find({}).sort({ createdAt: -1 }).lean(),
      FavoriteTrip.countDocuments({}),
    ]);

    const stats = {
      totalUsers: users.length,
      totalTrips: trips.length,
      publicTrips: trips.filter((trip) => trip.visibility === "Public").length,
      privateTrips: trips.filter((trip) => trip.visibility === "Private").length,
      activeTrips: trips.filter((trip) => trip.status === "In Progress").length,
      completedTrips: trips.filter((trip) => trip.status === "Done").length,
      cancelledTrips: trips.filter((trip) => trip.status === "Cancelled").length,
      totalTripMembers: trips.reduce((sum, trip) => sum + (Array.isArray(trip.members) ? trip.members.length : 0), 0),
      totalMessages: trips.reduce((sum, trip) => sum + (Array.isArray(trip.chatMessages) ? trip.chatMessages.length : 0), 0),
      totalContacts: contacts.length,
      unreadContacts: contacts.filter((contact) => contact.status === "new").length,
      totalFavorites: favoriteCount,
    };

    return res.status(200).json({
      stats,
      users: users.map((user: { _id: unknown }) => ({ ...user, _id: String(user._id) })),
      contacts: contacts.map((contact: { _id: unknown }) => ({ ...contact, _id: String(contact._id) })),
      recentTrips: trips.slice(0, 8).map((trip: { _id: unknown; members?: unknown[] }) => ({
        ...trip,
        _id: String(trip._id),
        joinedCount: Array.isArray(trip.members) ? trip.members.length : 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching admin overview:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
