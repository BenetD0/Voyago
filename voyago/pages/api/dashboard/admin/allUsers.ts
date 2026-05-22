import { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuth } from "../../../../src/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = await getRequestAuth(req);

    if (!token || (token as { role?: string }).role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    await connectDB();

    const users = await User.find({}, "-password").sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
