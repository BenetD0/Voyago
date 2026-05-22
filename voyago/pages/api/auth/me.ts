import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../src/lib/db";
import { getRequestAuth } from "../../../src/lib/auth";
import User from "../../../src/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Metoda jo e lejuar" });
  }

  try {
    const auth = await getRequestAuth(req);
    if (!auth?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await dbConnect();

    const user = await User.findOne({ email: auth.email }).select("-password -refreshTokens").lean();
    if (!user) {
      return res.status(404).json({ message: "Perdoruesi nuk u gjet" });
    }

    return res.status(200).json({
      user: {
        ...user,
        _id: String(user._id),
      },
    });
  } catch (error) {
    console.error("Gabim gjate marrjes se profilit:", error);
    return res.status(500).json({ message: "Gabim i brendshem i serverit" });
  }
}
