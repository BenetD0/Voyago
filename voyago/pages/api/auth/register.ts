import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../src/lib/db";
import User from "../../../src/models/User";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metoda jo e lejuar" });
  }

  try {
    await dbConnect();

    const { name, email, password } = req.body;

    // Validimi
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Të gjitha fushat janë të detyrueshme" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Fjalëkalimi duhet të jetë së paku 6 karaktere" });
    }

    // Kontrollo nëse përdoruesi ekziston
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Ky email është tashmë i regjistruar" });
    }

    // Hash fjalëkalimin
    const hashedPassword = await bcrypt.hash(password, 12);

    // Krijo përdoruesin
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    // Mos kthe fjalëkalimin
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(201).json({
      message: "Përdoruesi u krijua me sukses",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Gabim gjatë regjistrimit:", error);
    res.status(500).json({ message: "Gabim i brendshëm i serverit" });
  }
}