import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuth } from "../../../src/lib/auth";
import { createAuditLog } from "../../../src/lib/audit";
import dbConnect from "../../../src/lib/db";
import Trip from "../../../src/models/Trip";

export default async function tripChat(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = await getRequestAuth(req);
    if (!token?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { tripId, message } = req.body;
    if (!tripId || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ message: "Trip id and message are required" });
    }

    await dbConnect();

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const isAdmin = (token as { role?: string }).role === "admin";
    const isOwner = trip.userEmail === token.email;
    const isMember = trip.members.some((member: { email: string }) => member.email === token.email);

    if (!isAdmin && !isOwner && !isMember) {
      return res.status(403).json({ message: "Join the trip before sending messages" });
    }

    trip.chatMessages.push({
      senderName:
        typeof token.name === "string" && token.name.trim().length > 0 ? token.name.trim() : token.email.split("@")[0],
      senderEmail: token.email,
      message: message.trim(),
    });

    await trip.save();

    await createAuditLog({
      actorEmail: token.email,
      action: "trip.message_sent",
      entityType: "trip",
      entityId: String(trip._id),
      summary: `Sent a group message in ${trip.name || trip.destination}`,
    });

    return res.status(200).json({
      message: "Message sent",
      chatMessages: trip.chatMessages,
    });
  } catch (error) {
    console.error("Error sending trip chat message:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
