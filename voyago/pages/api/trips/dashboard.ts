import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuth } from "../../../src/lib/auth";
import dbConnect from "../../../src/lib/db";
import FavoriteTrip from "../../../src/models/FavoriteTrip";
import Friendship from "../../../src/models/Friendship";
import Trip from "../../../src/models/Trip";
import User from "../../../src/models/User";

export default async function tripDashboard(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = await getRequestAuth(req);
    if (!token?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = typeof req.query.id === "string" ? req.query.id : "";
    if (!id) {
      return res.status(400).json({ message: "Trip id is required" });
    }

    await dbConnect();

    const [trip, favorite, users, friendships] = await Promise.all([
      Trip.findById(id).lean(),
      FavoriteTrip.findOne({ userEmail: token.email, tripId: id }).lean(),
      User.find({}).select("name email avatarColor").lean(),
      Friendship.find({
        status: "accepted",
        $or: [{ requesterEmail: token.email }, { recipientEmail: token.email }],
      }).lean(),
    ]);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const isAdmin = (token as { role?: string }).role === "admin";
    const isOwner = trip.userEmail === token.email;
    const isMember = Array.isArray(trip.members) ? trip.members.some((member: { email: string }) => member.email === token.email) : false;

    if (!isAdmin && !isOwner && !isMember) {
      return res.status(403).json({ message: "You must join this trip before opening its dashboard" });
    }

    const userMap = new Map(
      users.map((user: { email: string; name?: string; avatarColor?: string }) => [user.email, user])
    );
    const friendEmails = new Set(
      friendships.map((item) => (item.requesterEmail === token.email ? item.recipientEmail : item.requesterEmail))
    );

    const members = Array.isArray(trip.members)
      ? trip.members.map((member: { email: string; name?: string; avatarColor?: string }) => ({
          ...member,
          name: userMap.get(member.email)?.name || member.name,
          avatarColor: userMap.get(member.email)?.avatarColor || "#22C55E",
          isFriend: friendEmails.has(member.email),
        }))
      : [];

    return res.status(200).json({
      ...trip,
      _id: String(trip._id),
      members,
      isFavorite: Boolean(favorite),
      joinedCount: members.length,
      isJoined: isMember,
      inviteLink: trip.inviteCode ? `/trips?invite=${trip.inviteCode}` : "",
    });
  } catch (error) {
    console.error("Error fetching trip dashboard:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
