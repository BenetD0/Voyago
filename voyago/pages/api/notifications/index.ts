import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuth } from "../../../src/lib/auth";
import dbConnect from "../../../src/lib/db";
import Notification from "../../../src/models/Notification";

export default async function notifications(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = await getRequestAuth(req);
    if (!token?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await dbConnect();

    if (req.method === "GET") {
      const items = await Notification.find({ userEmail: token.email }).sort({ createdAt: -1 }).limit(20).lean();
      return res.status(200).json(
        items.map((item) => ({
          ...item,
          _id: String(item._id),
        }))
      );
    }

    if (req.method === "PATCH") {
      const { notificationId, readAll } = req.body;

      if (readAll) {
        await Notification.updateMany({ userEmail: token.email, read: false }, { read: true });
        return res.status(200).json({ message: "Notifications marked as read" });
      }

      if (!notificationId) {
        return res.status(400).json({ message: "Notification id is required" });
      }

      await Notification.findOneAndUpdate({ _id: notificationId, userEmail: token.email }, { read: true });
      return res.status(200).json({ message: "Notification marked as read" });
    }

    res.setHeader("Allow", ["GET", "PATCH"]);
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Error handling notifications:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
