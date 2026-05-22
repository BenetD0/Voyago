import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuth } from "../../../src/lib/auth";
import dbConnect from "../../../src/lib/db";
import { createAuditLog } from "../../../src/lib/audit";
import { createNotification } from "../../../src/lib/notifications";
import Trip from "../../../src/models/Trip";

export default async function acceptInvite(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = await getRequestAuth(req);
    if (!token?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { inviteCode } = req.body;
    if (!inviteCode) {
      return res.status(400).json({ message: "Invite code is required" });
    }

    await dbConnect();

    const trip = await Trip.findOne({ inviteCode: String(inviteCode).toUpperCase() });
    if (!trip) {
      return res.status(404).json({ message: "Invite not found" });
    }

    const alreadyJoined = trip.members.some((member: { email: string }) => member.email === token.email);

    if (!alreadyJoined && trip.members.length >= trip.numberOfPeople) {
      return res.status(400).json({ message: "This group is already full" });
    }

    if (!alreadyJoined) {
      trip.members.push({
        name: typeof token.name === "string" && token.name.trim() ? token.name.trim() : token.email.split("@")[0],
        email: token.email,
      });
      await trip.save();

      await createNotification({
        userEmail: trip.userEmail,
        title: "A member joined from an invite",
        body: `${token.name || token.email} joined ${trip.name || trip.destination} using your invite link.`,
        type: "trip_join",
        data: { tripId: String(trip._id), senderEmail: token.email },
      });

      await createAuditLog({
        actorEmail: token.email,
        action: "trip.invite_accepted",
        entityType: "trip",
        entityId: String(trip._id),
        summary: `Joined ${trip.name || trip.destination} via invite`,
      });
    }

    return res.status(200).json({ message: "Invite accepted", tripId: String(trip._id) });
  } catch (error) {
    console.error("Error accepting trip invite:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
