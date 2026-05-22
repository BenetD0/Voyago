import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import dbConnect from "../../../src/lib/db";
import User from "../../../src/models/User";
import {
  buildAuthPayload,
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
    await dbConnect();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email dhe fjalekalim jane te detyrueshem" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Kredenciale te pavlefshme" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Kredenciale te pavlefshme" });
    }

    const payload = buildAuthPayload(user);
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);
    const refreshDecoded = verifyRefreshToken(refreshToken);
    const refreshTokenHash = hashToken(refreshToken);

    user.refreshTokens = (Array.isArray(user.refreshTokens) ? user.refreshTokens : []).filter(
      (item: { expiresAt: Date }) => new Date(item.expiresAt).getTime() > Date.now()
    );
    user.refreshTokens.push({
      tokenHash: refreshTokenHash,
      expiresAt: getTokenExpiryDate(refreshDecoded),
      createdAt: new Date(),
    });
    await user.save();

    return res.status(200).json({
      message: "Login i suksesshem",
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: 900,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Gabim gjate login:", error);
    return res.status(500).json({ message: "Gabim i brendshem i serverit" });
  }
}
