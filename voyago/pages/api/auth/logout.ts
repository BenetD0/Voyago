import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../src/lib/db";
import User from "../../../src/models/User";
import { hashToken, verifyRefreshToken } from "../../../src/lib/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metoda jo e lejuar" });
  }

  try {
    const { refreshToken } = req.body;
    if (!refreshToken || typeof refreshToken !== "string") {
      return res.status(400).json({ message: "Refresh token eshte i detyrueshem" });
    }

    const decoded = verifyRefreshToken(refreshToken);

    await dbConnect();

    const user = await User.findOne({ email: decoded.email });
    if (user) {
      const tokenHash = hashToken(refreshToken);
      user.refreshTokens = (Array.isArray(user.refreshTokens) ? user.refreshTokens : []).filter(
        (item: { tokenHash: string }) => item.tokenHash !== tokenHash
      );
      await user.save();
    }

    return res.status(200).json({ message: "Logout i suksesshem" });
  } catch (error) {
    console.error("Gabim gjate logout:", error);
    return res.status(401).json({ message: "Refresh token i pavlefshem ose i skaduar" });
  }
}
