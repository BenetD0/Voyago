import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../src/lib/db';
import User from '../../src/models/User';
import bcrypt from 'bcryptjs';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  // Lejo vetëm POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      message: `Method ${req.method} not allowed. Use POST.` 
    });
  }

  try {
    await dbConnect();

    const adminEmail = "admin@journeysyncsystem.com";     // Ndrysho nëse do
    const adminPassword = "AdminStrongPass2026";    // Ndrysho me një password të fortë!

    // Kontrollo nëse admini ekziston
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      return res.status(200).json({ 
        message: "Admini ekziston tashmë.",
        admin: {
          email: existingAdmin.email,
          role: existingAdmin.role
        }
      });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const newAdmin = await User.create({
      name: "Super Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin"                    // ← Rolli admin
    });

    res.status(201).json({
      success: true,
      message: "Admini u krijua me sukses! Mund të log in tani.",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });

  } catch (error: any) {
    console.error("Seed admin error:", error);
    res.status(500).json({ 
      message: "Gabim gjatë krijimit të adminit", 
      error: error.message 
    });
  }
}