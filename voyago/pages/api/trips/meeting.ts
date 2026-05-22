import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuth } from "../../../src/lib/auth";
import dbConnect from "../../../src/lib/db";
import { createAuditLog } from "../../../src/lib/audit";
import { createNotification } from "../../../src/lib/notifications";
import TripMeeting from "../../../src/models/TripMeeting";
import Trip from "../../../src/models/Trip";

type TripMember = {
  email: string;
  name: string;
};

function isTripMember(trip: { userEmail: string; members?: TripMember[] }, email: string, role?: string) {
  if (role === "admin") return true;
  if (trip.userEmail === email) return true;
  return Array.isArray(trip.members) ? trip.members.some((member: TripMember) => member.email === email) : false;
}

export default async function tripMeeting(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = await getRequestAuth(req);
    if (!token?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await dbConnect();

    if (req.method === "GET") {
      const tripId = typeof req.query.tripId === "string" ? req.query.tripId : "";
      if (!tripId) {
        return res.status(400).json({ message: "Trip id is required" });
      }

      const trip = await Trip.findById(tripId).lean();
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }

      const role = typeof token.role === "string" ? token.role : undefined;
      if (!isTripMember(trip, token.email, role)) {
        return res.status(403).json({ message: "You must be part of this trip meeting" });
      }

      const room = await TripMeeting.findOne({ tripId });
      if (!room) {
        return res.status(200).json({ active: false, participants: [], signals: [] });
      }

      const undeliveredSignals = room.signals.filter((signal: { to: string; deliveredTo: string[] }) => signal.to === token.email && !signal.deliveredTo.includes(token.email));
      undeliveredSignals.forEach((signal: { deliveredTo: string[] }) => signal.deliveredTo.push(token.email as string));

      const participant = room.participants.find((item: { email: string }) => item.email === token.email);
      if (participant) {
        participant.lastSeenAt = new Date();
      }

      await room.save();

      return res.status(200).json({
        active: room.active,
        hostEmail: room.hostEmail,
        participants: room.participants,
        signals: undeliveredSignals,
      });
    }

    if (req.method === "POST") {
      const { tripId, action, targetEmail, signalType, payload } = req.body;
      if (!tripId || !action) {
        return res.status(400).json({ message: "Trip id and action are required" });
      }

      const trip = await Trip.findById(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }

      const role = typeof token.role === "string" ? token.role : undefined;
      if (!isTripMember(trip.toObject(), token.email, role)) {
        return res.status(403).json({ message: "You must be part of this trip meeting" });
      }

      const defaultName =
        typeof token.name === "string" && token.name.trim().length > 0 ? token.name.trim() : token.email.split("@")[0];

      let room = await TripMeeting.findOne({ tripId });

      if (action === "start") {
        if (trip.userEmail !== token.email && role !== "admin") {
          return res.status(403).json({ message: "Only the host can start a meeting" });
        }

        room =
          room ||
          new TripMeeting({
            tripId,
            hostEmail: trip.userEmail,
            participants: [],
            signals: [],
          });

        room.active = true;
        room.hostEmail = trip.userEmail;
        room.signals = [];
        room.participants = [
          {
            email: token.email,
            name: defaultName,
            joinedAt: new Date(),
            lastSeenAt: new Date(),
          },
        ];

        await room.save();

        const memberEmails = Array.isArray(trip.members)
          ? trip.members.map((member: TripMember) => member.email).filter((email: string) => email !== token.email)
          : [];

        await Promise.all(
          memberEmails.map((email: string) =>
            createNotification({
              userEmail: email,
              title: "Trip meeting started",
              body: `${defaultName} started a live meeting in ${trip.name || trip.destination}.`,
              type: "system",
              data: { tripId: String(trip._id), senderEmail: token.email ?? undefined },
            })
          )
        );

        await createAuditLog({
          actorEmail: token.email,
          action: "meeting.started",
          entityType: "trip_meeting",
          entityId: String(room._id),
          summary: `Started a trip meeting for ${trip.name || trip.destination}`,
        });

        return res.status(200).json({ message: "Meeting started" });
      }

      if (!room || !room.active) {
        return res.status(400).json({ message: "Meeting is not active" });
      }

      if (action === "join") {
        const existingParticipant = room.participants.find((item: { email: string }) => item.email === token.email);
        if (!existingParticipant) {
          room.participants.push({
            email: token.email,
            name: defaultName,
            joinedAt: new Date(),
            lastSeenAt: new Date(),
          });
        } else {
          existingParticipant.lastSeenAt = new Date();
        }

        await room.save();

        await createAuditLog({
          actorEmail: token.email,
          action: "meeting.joined",
          entityType: "trip_meeting",
          entityId: String(room._id),
          summary: `Joined the trip meeting for ${trip.name || trip.destination}`,
        });

        return res.status(200).json({ message: "Joined meeting" });
      }

      if (action === "leave") {
        room.participants = room.participants.filter((item: { email: string }) => item.email !== token.email);
        if (room.participants.length === 0 || token.email === room.hostEmail) {
          room.active = false;
          room.signals = [];
          room.participants = [];
        }
        await room.save();
        return res.status(200).json({ message: "Left meeting" });
      }

      if (action === "end") {
        if (token.email !== room.hostEmail && role !== "admin") {
          return res.status(403).json({ message: "Only the host can end the meeting" });
        }
        room.active = false;
        room.signals = [];
        room.participants = [];
        await room.save();
        return res.status(200).json({ message: "Meeting ended" });
      }

      if (action === "signal") {
        if (!targetEmail || !signalType) {
          return res.status(400).json({ message: "Target email and signal type are required" });
        }

        room.signals.push({
          from: token.email,
          to: targetEmail,
          type: signalType,
          payload: payload || {},
          deliveredTo: [],
        });

        await room.save();
        return res.status(200).json({ message: "Signal sent" });
      }

      return res.status(400).json({ message: "Unsupported action" });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Trip meeting error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
