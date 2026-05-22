// src/models/Contact.ts
import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Emri është i detyrueshëm"], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, "Email-i është i detyrueshëm"], 
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Ju lutem shkruani një email të vlefshëm"]
  },
  subject: { 
    type: String, 
    required: false,
    trim: true,
    default: "Contact Form"
  },
  message: { 
    type: String, 
    required: [true, "Mesazhi është i detyrueshëm"], 
    trim: true 
  },
  // Opsionale: mund të shtosh status nëse do admin të shohë a është lexuar
  status: {
    type: String,
    enum: ["new", "read", "replied"],
    default: "new"
  },
  // Nëse do të dish cili admin e ka lexuar (opsional)
  // repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { 
  timestamps: true,
  collection: "journeysync_contacts"   // ← Kjo e bën tabelën siç e do ti
});

export default mongoose.models.Contact || mongoose.model("Contact", ContactSchema);