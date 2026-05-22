import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuth } from "../../../src/lib/auth";
import dbConnect from "../../../src/lib/db";
import { createAuditLog } from "../../../src/lib/audit";
import { createNotification } from "../../../src/lib/notifications";
import Friendship from "../../../src/models/Friendship";
import Trip from "../../../src/models/Trip";
import User from "../../../src/models/User";

export default async function friends(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = await getRequestAuth(req);
    if (!token?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await dbConnect();

    if (req.method === "GET") {
      const [relationships, users] = await Promise.all([
        Friendship.find({
          $or: [{ requesterEmail: token.email }, { recipientEmail: token.email }],
        }).sort({ createdAt: -1 }).lean(),
        User.find({}).select("name email avatarColor").lean(),
      ]);

      const userMap = new Map(
        users.map((user: { email: string; name?: string; avatarColor?: string }) => [user.email, user])
      );

      const decorated = relationships.map((item) => {
        const friendEmail = item.requesterEmail === token.email ? item.recipientEmail : item.requesterEmail;
        const friendUser = userMap.get(friendEmail);
        return {
          _id: String(item._id),
          status: item.status,
          tripId: item.tripId || "",
          friend: {
            email: friendEmail,
            name: friendUser?.name || friendEmail.split("@")[0],
            avatarColor: friendUser?.avatarColor || "#22C55E",
          },
          incoming: item.recipientEmail === token.email && item.status === "pending",
        };
      });

      return res.status(200).json(decorated);
    }

    if (req.method === "POST") {
      const { friendEmail, tripId } = req.body;
      if (!friendEmail || friendEmail === token.email) {
        return res.status(400).json({ message: "A valid friend email is required" });
      }

      if (!tripId) {
        return res.status(400).json({ message: "Trip id is required" });
      }

      const trip = await Trip.findById(tripId).lean();
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }

      const requesterInTrip = Array.isArray(trip.members) && trip.members.some((member: { email?: string }) => member.email === token.email);
      const recipientInTrip = Array.isArray(trip.members) && trip.members.some((member: { email?: string }) => member.email === friendEmail);

      if (!requesterInTrip || !recipientInTrip) {
        return res.status(403).json({ message: "You can only add friends from the same group" });
      }

      const existing = await Friendship.findOne({
        $or: [
          { requesterEmail: token.email, recipientEmail: friendEmail },
          { requesterEmail: friendEmail, recipientEmail: token.email },
        ],
      });

      if (existing) {
        return res.status(200).json({ message: existing.status === "accepted" ? "Already friends" : "Friend request already exists" });
      }

      const friendship = await Friendship.create({
        requesterEmail: token.email,
        recipientEmail: friendEmail,
        tripId,
        status: "pending",
      });

      await createNotification({
        userEmail: friendEmail,
        title: "New friend request",
        body: `${token.name || token.email} sent you a friend request from your group.`,
        type: "friend_request",
        data: { friendEmail: token.email, tripId },
      });

      await createAuditLog({
        actorEmail: token.email,
        action: "friend.requested",
        entityType: "friendship",
        entityId: String(friendship._id),
        summary: `Sent a friend request to ${friendEmail}`,
        metadata: { tripId },
      });

      return res.status(201).json({ message: "Friend request sent" });
    }

    if (req.method === "PATCH") {
      const { friendshipId } = req.body;
      if (!friendshipId) {
        return res.status(400).json({ message: "Friendship id is required" });
      }

      const friendship = await Friendship.findOne({ _id: friendshipId, recipientEmail: token.email });
      if (!friendship) {
        return res.status(404).json({ message: "Friend request not found" });
      }

      friendship.status = "accepted";
      await friendship.save();

      await createNotification({
        userEmail: friendship.requesterEmail,
        title: "Friend request accepted",
        body: `${token.name || token.email} accepted your friend request.`,
        type: "friend_accept",
        data: { friendEmail: token.email, tripId: friendship.tripId || "" },
      });

      await createAuditLog({
        actorEmail: token.email,
        action: "friend.accepted",
        entityType: "friendship",
        entityId: String(friendship._id),
        summary: `Accepted friend request from ${friendship.requesterEmail}`,
      });

      return res.status(200).json({ message: "Friend request accepted" });
    }

    res.setHeader("Allow", ["GET", "POST", "PATCH"]);
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Error handling friends:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
