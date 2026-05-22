import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuth } from "../../../src/lib/auth";
import dbConnect from "../../../src/lib/db";
import { createAuditLog } from "../../../src/lib/audit";
import Trip from "../../../src/models/Trip";

export default async function tripCms(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = await getRequestAuth(req);
    if (!token?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { tripId, dashboardTheme, dashboardContent } = req.body;
    if (!tripId) {
      return res.status(400).json({ message: "Trip id is required" });
    }

    await dbConnect();

    const trip = await Trip.findOne({ _id: tripId, userEmail: token.email });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (dashboardTheme) {
      trip.dashboardTheme = dashboardTheme;
    }

    if (dashboardContent && typeof dashboardContent === "object") {
      trip.dashboardContent = {
        heroTitle: typeof dashboardContent.heroTitle === "string" ? dashboardContent.heroTitle : trip.dashboardContent?.heroTitle || "",
        heroDescription:
          typeof dashboardContent.heroDescription === "string"
            ? dashboardContent.heroDescription
            : trip.dashboardContent?.heroDescription || "",
        highlights: Array.isArray(dashboardContent.highlights)
          ? dashboardContent.highlights.filter((item: unknown) => typeof item === "string")
          : trip.dashboardContent?.highlights || [],
        hostNotes: typeof dashboardContent.hostNotes === "string" ? dashboardContent.hostNotes : trip.dashboardContent?.hostNotes || "",
      };
    }

    await trip.save();

    await createAuditLog({
      actorEmail: token.email,
      action: "trip.cms_updated",
      entityType: "trip",
      entityId: String(trip._id),
      summary: `Updated dashboard content for ${trip.name || trip.destination}`,
    });

    return res.status(200).json({ message: "Trip dashboard updated", trip });
  } catch (error) {
    console.error("Error updating trip CMS:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
