import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuth } from "../../../src/lib/auth";
import dbConnect from "../../../src/lib/db";
import { createAuditLog } from "../../../src/lib/audit";
import { createNotification } from "../../../src/lib/notifications";
import DirectMessage from "../../../src/models/DirectMessage";
import Friendship from "../../../src/models/Friendship";
import Trip from "../../../src/models/Trip";

function generateInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function getConversationKey(a: string, b: string) {
  return [a.toLowerCase(), b.toLowerCase()].sort().join("__");
}

export default async function inviteTrip(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = await getRequestAuth(req);
    if (!token?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { tripId, friendEmail } = req.body;
    if (!tripId) {
      return res.status(400).json({ message: "Trip id is required" });
    }

    await dbConnect();

    const trip = await Trip.findOne({ _id: tripId, userEmail: token.email });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (!trip.inviteCode) {
      trip.inviteCode = generateInviteCode();
      await trip.save();
    }

    const inviteLink = `/trips?invite=${trip.inviteCode}`;

    if (friendEmail) {
      const friendship = await Friendship.findOne({
        status: "accepted",
        $or: [
          { requesterEmail: token.email, recipientEmail: friendEmail },
          { requesterEmail: friendEmail, recipientEmail: token.email },
        ],
      });

      if (!friendship) {
        return res.status(403).json({ message: "You can only send invites to friends" });
      }

      await DirectMessage.findOneAndUpdate(
        { conversationKey: getConversationKey(token.email, friendEmail) },
        {
          $setOnInsert: {
            conversationKey: getConversationKey(token.email, friendEmail),
            participants: [token.email, friendEmail],
          },
          $push: {
            messages: {
              senderEmail: token.email,
              senderName: token.name || token.email.split("@")[0],
              text: `Private trip invite: ${trip.name || trip.destination}. Use invite code ${trip.inviteCode} or open ${inviteLink}`,
            },
          },
        },
        { upsert: true, new: true }
      );

      await createNotification({
        userEmail: friendEmail,
        title: "Private trip invitation",
        body: `${token.name || token.email} invited you to join ${trip.name || trip.destination}.`,
        type: "trip_invite",
        data: {
          tripId: String(trip._id),
          inviteCode: trip.inviteCode,
          senderEmail: token.email,
        },
      });
    }

    await createAuditLog({
      actorEmail: token.email,
      action: "trip.invite_created",
      entityType: "trip",
      entityId: String(trip._id),
      summary: friendEmail ? `Sent a trip invite to ${friendEmail}` : "Generated a trip invite link",
      metadata: { inviteCode: trip.inviteCode },
    });

    return res.status(200).json({
      message: friendEmail ? "Invite sent successfully" : "Invite link generated",
      inviteCode: trip.inviteCode,
      inviteLink,
    });
  } catch (error) {
    console.error("Error handling trip invite:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
