import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuth } from "../../../../src/lib/auth";
import { createAuditLog } from "../../../../src/lib/audit";
import dbConnect from "../../../../src/lib/db";
import Trip from "../../../../src/models/Trip";

function generateInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default async function addTrip(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = await getRequestAuth(req);

    if (!token?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await dbConnect();

    const { name, destination, tripDay, hour, description, numberOfPeople, visibility, status } = req.body;
    const selectedTripDay = new Date(tripDay);
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (Number.isNaN(selectedTripDay.getTime()) || selectedTripDay < tomorrow) {
      return res.status(400).json({ message: "Trip date must be from tomorrow onward" });
    }

    const capacity = Number(numberOfPeople);
    if (!Number.isFinite(capacity) || capacity < 1) {
      return res.status(400).json({ message: "Group limit must be at least 1" });
    }

    const memberName =
      typeof token.name === "string" && token.name.trim().length > 0 ? token.name.trim() : token.email.split("@")[0];

    const newTrip = new Trip({
      name,
      userEmail: token.email,
      destination,
      tripDay,
      hour,
      description,
      numberOfPeople: capacity,
      visibility,
      status,
      inviteCode: visibility === "Private" ? generateInviteCode() : "",
      dashboardTheme: "forest",
      dashboardContent: {
        heroTitle: name || destination,
        heroDescription: description,
        highlights: [destination, `${capacity} spots`, status].filter(Boolean),
        hostNotes: "",
      },
      members: [
        {
          name: memberName,
          email: token.email,
        },
      ],
      chatMessages: [],
    });

    await newTrip.save();

    await createAuditLog({
      actorEmail: token.email,
      action: "trip.created",
      entityType: "trip",
      entityId: String(newTrip._id),
      summary: `Created ${name || destination}`,
    });

    return res.status(201).json({ message: "Trip added successfully", trip: newTrip });
  } catch (error) {
    console.error("Error adding trip:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
