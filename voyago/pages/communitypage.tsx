"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Lock, Globe, ArrowRight, Sparkles, Heart, Share2, Zap, CheckCircle } from "lucide-react";

const privateFeatures = [
  "Only for people you invite",
  "Invitation code or private link",
  "Secure and intimate planning",
  "Shared expenses only within the group",
  "Private real-time chat",
  "Photos and memories just for the group",
];

const publicFeatures = [
  "Open to all community members",
  "Meet new people with similar interests",
  "Spontaneous events and trips",
  "Socialize and new adventures",
  "Discover trips from other travelers",
  "Leaderboard and badge system (coming soon)",
];

export default function Community() {
  const [activeTab, setActiveTab] = useState<"private" | "public">("private");

  return (
    <div className="min-h-screen bg-[#faf6f1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#ea580c]/10 text-[#ea580c] px-4 py-2 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Voyago Community</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#7c2d12] tracking-tight mb-4">
            Travel your way
          </h1>
          <p className="text-xl text-[#a8a29e] max-w-3xl mx-auto">
            Choose between <span className="font-semibold text-[#ea580c]">private</span> trips with family and friends,
            or <span className="font-semibold text-[#ea580c]">public</span> trips to meet new travelers from around the world.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-full p-1 flex shadow-sm border border-[#a8a29e]/20">
            <button
              onClick={() => setActiveTab("private")}
              className={`px-6 md:px-8 py-2.5 rounded-full font-semibold transition-all flex items-center gap-2 text-sm md:text-base ${
                activeTab === "private"
                  ? "bg-[#ea580c] text-white shadow-sm"
                  : "text-[#a8a29e] hover:text-[#7c2d12]"
              }`}
            >
              <Lock className="w-4 h-4" />
              Private Trips
            </button>
            <button
              onClick={() => setActiveTab("public")}
              className={`px-6 md:px-8 py-2.5 rounded-full font-semibold transition-all flex items-center gap-2 text-sm md:text-base ${
                activeTab === "public"
                  ? "bg-[#ea580c] text-white shadow-sm"
                  : "text-[#a8a29e] hover:text-[#7c2d12]"
              }`}
            >
              <Globe className="w-4 h-4" />
              Public Community
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* PRIVATE TRIPS */}
          {activeTab === "private" && (
            <motion.div
              key="private"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div>
                  <div className="inline-flex items-center gap-2 bg-[#ea580c]/10 text-[#ea580c] px-4 py-1.5 rounded-full mb-4">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-medium">For those who want intimacy</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-[#7c2d12] leading-tight mb-4">
                    Create your private group
                  </h2>
                  <p className="text-[#a8a29e] mb-6">
                    Invite only the people you want. Plan your trip in a secure space without outside interference.
                  </p>

                  <div className="space-y-3 mb-8">
                    {privateFeatures.map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-[#ea580c] mt-0.5 flex-shrink-0" />
                        <span className="text-[#7c2d12]">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold px-8 py-3 rounded-full flex items-center gap-2 transition shadow-sm"
                  >
                    Create Private Group
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Visual Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-md border border-[#a8a29e]/20 p-6 md:p-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-[#ea580c]" />
                      <span className="text-sm font-medium text-[#a8a29e]">Private Group</span>
                    </div>
                    <Heart className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#7c2d12] mb-2">Family in Santorini</h3>
                  <p className="text-[#a8a29e] text-sm mb-4">6 members • Invite only</p>
                  <div className="h-32 bg-gradient-to-r from-[#ea580c]/20 to-[#7c2d12]/20 rounded-xl flex items-center justify-center">
                    <span className="text-4xl">🏝️</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* PUBLIC COMMUNITY */}
          {activeTab === "public" && (
            <motion.div
              key="public"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div>
                  <div className="inline-flex items-center gap-2 bg-[#ea580c]/10 text-[#ea580c] px-4 py-1.5 rounded-full mb-4">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium">For social adventurers</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-[#7c2d12] leading-tight mb-4">
                    Join the community
                  </h2>
                  <p className="text-[#a8a29e] mb-6">
                    Create or join public trips. Socialize, share experiences and create memories with people from all over the world.
                  </p>

                  <div className="space-y-3 mb-8">
                    {publicFeatures.map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <Zap className="w-5 h-5 text-[#ea580c] mt-0.5 flex-shrink-0" />
                        <span className="text-[#7c2d12]">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold px-8 py-3 rounded-full flex items-center gap-2 transition shadow-sm"
                  >
                    Browse Public Trips
                    <Globe className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Visual Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-md border border-[#a8a29e]/20 p-6 md:p-8"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-[#ea580c]" />
                      <span className="text-sm font-medium text-[#a8a29e]">Public Trip • LIVE</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-[#a8a29e]" />
                      <span className="text-sm font-medium text-[#7c2d12]">28</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#7c2d12] mb-2">Hiking in the Accursed Mountains</h3>
                  <div className="w-full bg-[#E2E8F0] rounded-full h-2 mb-4">
                    <div className="bg-[#ea580c] h-2 rounded-full w-[65%]" />
                  </div>
                  <p className="text-[#a8a29e] text-sm italic">“An unforgettable adventure with fantastic people”</p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-[#7c2d12] mb-4">
              Ready to start your trip?
            </h3>
            <p className="text-[#a8a29e] mb-8">
              Create your first trip now — whether private with loved ones, or public to meet new people.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold px-8 py-3 rounded-full transition shadow-sm">
                Create Private Group
              </button>
              <button className="border-2 border-[#a8a29e]/30 hover:border-[#ea580c] text-[#7c2d12] font-semibold px-8 py-3 rounded-full transition">
                Browse Public Trips
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}