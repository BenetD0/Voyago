"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Globe, Mail, User, MessageSquare, ArrowRight, Phone, MapPin } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // Simulate API call (replace with real API)
    setTimeout(() => {
      setStatus({ type: "success", message: "Message sent successfully! We'll get back to you soon." });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FAF3E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#ea580c]/10 text-[#ea580c] text-sm font-medium px-4 py-2 rounded-full mb-4"
          >
            <Mail className="w-4 h-4" />
            Contact us
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#c2d12] tracking-tight mb-4">
            Lets talk about
            <br />
            <span className="text-[#ea580c]">your trip</span>
          </h1>

          <p className="text-lg text-[#7C5E3C] max-w-2xl mx-auto">
            Have questions, suggestions, or want to collaborate?
            We are here to help you create the perfect adventure.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-[#7C5E3C]/20 p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[#c2d12] text-sm font-medium mb-2">Full name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7C5E3C]" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full border border-[#7C5E3C]/30 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#ea580c] focus:border-transparent transition"
                        placeholder="First and last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#c2d12] text-sm font-medium mb-2">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7C5E3C]" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full border border-[#7C5E3C]/30 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#ea580c] focus:border-transparent transition"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[#c2d12] text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full border border-[#7C5E3C]/30 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#ea580c] focus:border-transparent transition"
                    placeholder="What would you like to talk about?"
                  />
                </div>

                <div>
                  <label className="block text-[#c2d12] text-sm font-medium mb-2">Message *</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-[#7C5E3C]" />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full border border-[#7C5E3C]/30 rounded-xl pl-10 pr-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#ea580c] focus:border-transparent transition resize-none"
                      placeholder="Write your message here..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ea580c] hover:bg-[#16A34A] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Info Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-[#7C5E3C]/20 p-6 sm:p-8">
              <h3 className="text-xl font-bold text-[#c2d12] mb-6">Useful information</h3>
              
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-[#ea580c]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#ea580c]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#c2d12]">Email</p>
                    <p className="text-[#7C5E3C] text-sm">hello@voyago.com</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-[#ea580c]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#ea580c]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#c2d12]">Phone</p>
                    <p className="text-[#7C5E3C] text-sm">+383 49 123 456</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-[#ea580c]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#ea580c]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#c2d12]">Address</p>
                    <p className="text-[#7C5E3C] text-sm">Pristina, Kosovo</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[#7C5E3C]/20">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-[#ea580c]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-[#ea580c]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#c2d12]">Fast response</p>
                    <p className="text-[#7C5E3C] text-sm">Usually within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#ea580c]/10 rounded-2xl p-6 text-center border border-[#ea580c]/20">
              <p className="text-[#c2d12] text-sm">
                🚀 <span className="font-medium">Ready to start?</span> Create your first trip and begin the adventure!
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Status Message Toast */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-center font-medium shadow-lg z-50 ${
              status.type === "success" 
                ? "bg-[#ea580c] text-white" 
                : "bg-red-600 text-white"
            }`}
          >
            {status.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
