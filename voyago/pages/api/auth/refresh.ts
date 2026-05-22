import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../src/lib/db";
import User from "../../../src/models/User";
import {
  createAccessToken,
  createRefreshToken,
  getTokenExpiryDate,
  hashToken,
  verifyRefreshToken,
} from "../../../src/lib/jwt";

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
    if (!user) {
      return res.status(401).json({ message: "Refresh token i pavlefshem" });
    }

    const currentHash = hashToken(refreshToken);
    const validStoredToken = (Array.isArray(user.refreshTokens) ? user.refreshTokens : []).find(
      (item: { tokenHash: string; expiresAt: Date }) =>
        item.tokenHash === currentHash && new Date(item.expiresAt).getTime() > Date.now()
    );

    if (!validStoredToken) {
      return res.status(401).json({ message: "Refresh token i pavlefshem ose i skaduar" });
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role || "user",
    };

    const newAccessToken = createAccessToken(payload);
    const newRefreshToken = createRefreshToken(payload);
    const newRefreshDecoded = verifyRefreshToken(newRefreshToken);
    const newRefreshHash = hashToken(newRefreshToken);

    user.refreshTokens = (Array.isArray(user.refreshTokens) ? user.refreshTokens : [])
      .filter((item: { tokenHash: string; expiresAt: Date }) => {
        const notExpired = new Date(item.expiresAt).getTime() > Date.now();
        return notExpired && item.tokenHash !== currentHash;
      })
      .concat([
        {
          tokenHash: newRefreshHash,
          expiresAt: getTokenExpiryDate(newRefreshDecoded),
          createdAt: new Date(),
        },
      ]);

    await user.save();

    return res.status(200).json({
      message: "Token-at u rifreskuan me sukses",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      tokenType: "Bearer",
      expiresIn: 900,
    });
  } catch (error) {
    console.error("Gabim gjate refresh:", error);
    return res.status(401).json({ message: "Refresh token i pavlefshem ose i skaduar" });
  }
}
