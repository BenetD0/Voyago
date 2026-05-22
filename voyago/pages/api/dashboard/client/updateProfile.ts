import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuth } from "../../../../src/lib/auth";
import dbConnect from "../../../../src/lib/db";
import { createAuditLog } from "../../../../src/lib/audit";
import User from "../../../../src/models/User";

export default async function updateProfile(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = await getRequestAuth(req);
    if (!token?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, bio, city, travelStyle, avatarColor } = req.body;

    await dbConnect();

    const user = await User.findOne({ email: token.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = typeof name === "string" && name.trim() ? name.trim() : user.name;
    user.bio = typeof bio === "string" ? bio.trim() : user.bio;
    user.city = typeof city === "string" ? city.trim() : user.city;
    user.travelStyle = typeof travelStyle === "string" ? travelStyle.trim() : user.travelStyle;
    user.avatarColor = typeof avatarColor === "string" && avatarColor.trim() ? avatarColor.trim() : user.avatarColor;

    await user.save();

    await createAuditLog({
      actorEmail: token.email,
      action: "profile.updated",
      entityType: "user",
      entityId: String(user._id),
      summary: "Updated profile details",
    });

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
