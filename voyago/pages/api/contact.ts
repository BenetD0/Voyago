import type { NextApiRequest, NextApiResponse } from "next";
import { getRequestAuth } from "../../src/lib/auth";
import dbConnect from "../../src/lib/db";
import Contact from "../../src/models/Contact";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      await dbConnect();

      const { name, email, subject, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ message: "Name, email, and message are required" });
      }

      const newContact = await Contact.create({
        name,
        email,
        subject: subject || "Contact Form",
        message,
      });

      return res.status(201).json({
        success: true,
        message: "Message sent successfully. Thank you.",
        contact: newContact,
      });
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({
        success: false,
        message: "Failed to send message",
        error: errorMessage,
      });
    }
  }

  if (req.method === "GET") {
    try {
      const token = await getRequestAuth(req);
      if (!token || (token as { role?: string }).role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }

      await dbConnect();
      const contacts = await Contact.find({}).sort({ createdAt: -1 }).lean();
      return res.status(200).json(
        contacts.map((contact: { _id: unknown }) => ({
          ...contact,
          _id: String(contact._id),
        }))
      );
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: "Method not allowed" });
}
