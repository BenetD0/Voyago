import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuth } from "../../../../src/lib/auth";
import dbConnect from "../../../../src/lib/db";
import Trip from "../../../../src/models/Trip";

export default async function updateTrip(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = await getRequestAuth(req);

    if (!token?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id, destination, tripDay, status, visibility, name, description, hour, numberOfPeople } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Trip id is required" });
    }

    await dbConnect();

    const trip = await Trip.findOne({ _id: id, userEmail: token.email });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (tripDay !== undefined) {
      const selectedTripDay = new Date(tripDay);
      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (Number.isNaN(selectedTripDay.getTime()) || selectedTripDay < tomorrow) {
        return res.status(400).json({ message: "Trip date must be from tomorrow onward" });
      }
    }

    if (numberOfPeople !== undefined) {
      const capacity = Number(numberOfPeople);
      if (!Number.isFinite(capacity) || capacity < 1) {
        return res.status(400).json({ message: "Group limit must be at least 1" });
      }
      if (capacity < trip.members.length) {
        return res.status(400).json({ message: "Group limit cannot be smaller than the current member count" });
      }
      trip.numberOfPeople = capacity;
    }

    if (destination !== undefined) {
      trip.destination = destination;
    }
    if (tripDay !== undefined) {
      trip.tripDay = tripDay;
    }
    if (status !== undefined) {
      trip.status = status;
    }
    if (visibility !== undefined) {
      trip.visibility = visibility;
    }
    if (name !== undefined) {
      trip.name = name;
    }
    if (description !== undefined) {
      trip.description = description;
    }
    if (hour !== undefined) {
      trip.hour = hour;
    }

    await trip.save();

    return res.status(200).json({ message: "Trip updated successfully", trip });
  } catch (error) {
    console.error("Error updating trip:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
