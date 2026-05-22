import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuth } from "../../../../src/lib/auth";
import dbConnect from "../../../../src/lib/db";
import AuditLog from "../../../../src/models/AuditLog";
import Friendship from "../../../../src/models/Friendship";
import Notification from "../../../../src/models/Notification";
import Trip from "../../../../src/models/Trip";
import User from "../../../../src/models/User";

export default async function getUser(req: NextApiRequest, res: NextApiResponse) {
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

    const [user, joinedTrips, friendships, notifications, auditLogs] = await Promise.all([
      User.findOne({ email: token.email }).select("-password").lean(),
      Trip.find({ "members.email": token.email }).select("name destination visibility").lean(),
      Friendship.find({
        $or: [{ requesterEmail: token.email }, { recipientEmail: token.email }],
        status: "accepted",
      }).lean(),
      Notification.find({ userEmail: token.email }).sort({ createdAt: -1 }).limit(6).lean(),
      AuditLog.find({ actorEmail: token.email }).sort({ createdAt: -1 }).limit(8).lean(),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profileFields = [user.name, user.email, user.bio, user.city, user.travelStyle];
    const completedFields = profileFields.filter((field) => typeof field === "string" && field.trim().length > 0).length;
    const completion = Math.round((completedFields / profileFields.length) * 100);

    return res.status(200).json({
      id: String(user._id),
      name: user.name,
      email: user.email,
      bio: user.bio || "",
      city: user.city || "",
      travelStyle: user.travelStyle || "",
      avatarColor: user.avatarColor || "#22C55E",
      profileCompletion: completion,
      stats: {
        joinedTrips: joinedTrips.length,
        friends: friendships.length,
        notifications: notifications.filter((item: { read?: boolean }) => !item.read).length,
      },
      joinedTrips: joinedTrips.map((trip: { _id: unknown; name?: string; destination?: string; visibility?: string }) => ({
        _id: String(trip._id),
        name: trip.name || trip.destination,
        visibility: trip.visibility,
      })),
      recentNotifications: notifications.map((item) => ({
        ...item,
        _id: String(item._id),
      })),
      auditLogs: auditLogs.map((item) => ({
        ...item,
        _id: String(item._id),
      })),
    });
  } catch (error) {
    console.error("getUser error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
