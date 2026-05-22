import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../src/lib/db";
import User from "../../../src/models/User";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metoda jo e lejuar" });
  }

  try {
    await dbConnect();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email dhe fjalëkalim janë të detyrueshëm" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Fjalëkalimi duhet të ketë së paku 6 karaktere" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Nuk u gjet asnjë llogari me këtë email" });
    }

    // Hash fjalëkalimin e ri
    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ 
      success: true,
      message: "Fjalëkalimi u ndryshua me sukses!" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gabim i brendshëm i serverit" });
  }
}