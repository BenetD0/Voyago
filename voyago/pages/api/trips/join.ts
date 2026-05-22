import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuth } from "../../../src/lib/auth";
import { createAuditLog } from "../../../src/lib/audit";
import dbConnect from "../../../src/lib/db";
import { createNotification } from "../../../src/lib/notifications";
import Trip from "../../../src/models/Trip";

export default async function joinTrip(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = await getRequestAuth(req);
    if (!token?.email) {
      return res.status(401).json({ message: "You must be logged in to join a trip" });
    }

    const { tripId } = req.body;
    if (!tripId) {
      return res.status(400).json({ message: "Trip id is required" });
    }

    await dbConnect();

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (trip.visibility !== "Public") {
      return res.status(400).json({ message: "Only public trips can be joined" });
    }

    const alreadyJoined = trip.members.some((member: { email: string }) => member.email === token.email);
    if (!alreadyJoined && trip.members.length >= trip.numberOfPeople) {
      return res.status(400).json({ message: "This trip is already full" });
    }

    if (!alreadyJoined) {
      const joiningName =
        typeof token.name === "string" && token.name.trim().length > 0 ? token.name.trim() : token.email.split("@")[0];

      trip.members.push({
        name: joiningName,
        email: token.email,
      });
      await trip.save();

      const recipientEmails = trip.members.map((member: { email: string }) => member.email).filter((email: string) => email !== token.email);
      await Promise.all(
        recipientEmails.map((email: string) =>
          createNotification({
            userEmail: email,
            title: "New group member",
            body: `${joiningName} joined ${trip.name || trip.destination}.`,
            type: "trip_join",
            data: { tripId: String(trip._id), senderEmail: token.email },
          })
        )
      );

      await createAuditLog({
        actorEmail: token.email,
        action: "trip.joined",
        entityType: "trip",
        entityId: String(trip._id),
        summary: `Joined ${trip.name || trip.destination}`,
      });
    }

    return res.status(200).json({
      message: alreadyJoined ? "You have already joined this trip" : "Trip joined successfully",
      tripId: String(trip._id),
    });
  } catch (error) {
    console.error("Error joining trip:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
