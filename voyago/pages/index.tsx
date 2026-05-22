"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import cs from "classnames";
import {
  Plane,
  Map,
  Users,
  Compass,
  ArrowRight,
  Globe,
  Sparkles,
  Calendar,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Play,
  Pause,
  X,
  CreditCard,
  Lock,
  MessageCircle,
  Send,
  CheckCircle,
  Zap,
  MapPin,
} from "lucide-react";

const destinations = [
  {
    id: 1,
    name: "Zermatt, Zvicër",
    country: "Zvicër",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop",
    liveTrips: 24,
    rating: 4.9,
  },
  {
    id: 2,
    name: "Santorini, Greqi",
    country: "Greqi",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop",
    liveTrips: 42,
    rating: 4.95,
  },
  {
    id: 3,
    name: "Kyoto, Japoni",
    country: "Japoni",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop",
    liveTrips: 38,
    rating: 4.88,
  },
  {
    id: 4,
    name: "Machu Picchu, Peru",
    country: "Peru",
    image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&h=600&fit=crop",
    liveTrips: 17,
    rating: 4.92,
  },
  {
    id: 5,
    name: "Dolomites, Itali",
    country: "Itali",
    image: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=800&h=600&fit=crop",
    liveTrips: 31,
    rating: 4.87,
  },
];

const roadmapSteps = [
  {
    step: 1,
    title: "Create your trip",
    description: "Choose destination, dates, and invite your travel companions.",
    icon: Calendar,
  },
  {
    step: 2,
    title: "Plan together",
    description: "Add attractions, hotels, and restaurants in real-time.",
    icon: Users,
  },
  {
    step: 3,
    title: "Live sync",
    description: "All changes appear instantly for everyone.",
    icon: Globe,
  },
  {
    step: 4,
    title: "Explore & share",
    description: "Upload photos, write comments, and keep memories alive.",
    icon: Sparkles,
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatReplies, setChatReplies] = useState<{ text: string; isBot: boolean }[]>([
    { text: "Hello! How can I help you with your Voyago trip?", isBot: true },
  ]);

  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.3 });

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % destinations.length);
    resetAutoplay();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + destinations.length) % destinations.length);
    resetAutoplay();
  };

  const resetAutoplay = () => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    if (autoplay) {
      autoplayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % destinations.length);
      }, 5000);
    }
  };

  useEffect(() => {
    if (autoplay) {
      autoplayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % destinations.length);
      }, 5000);
    }
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [autoplay]);

  const [counts, setCounts] = useState({ trips: 0, users: 0, countries: 0 });
  useEffect(() => {
    if (isStatsInView) {
      const duration = 2000;
      const interval = 20;
      const steps = duration / interval;
      const targetTrips = 124000;
      const targetUsers = 43000;
      const targetCountries = 98;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        setCounts({
          trips: Math.min(targetTrips, Math.floor((step / steps) * targetTrips)),
          users: Math.min(targetUsers, Math.floor((step / steps) * targetUsers)),
          countries: Math.min(targetCountries, Math.floor((step / steps) * targetCountries)),
        });
        if (step >= steps) clearInterval(timer);
      }, interval);
      return () => clearInterval(timer);
    }
  }, [isStatsInView]);

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;
    setChatReplies((prev) => [...prev, { text: chatMessage, isBot: false }]);
    setTimeout(() => {
      const botReplies = [
        "Of course! Have you already chosen a destination?",
        "You can create a new trip by clicking the 'Create New Trip' button.",
        "For private trips, simply enable the private option during creation.",
        "What kind of help do you need? I'm here to support your Voyago adventure!",
      ];
      setChatReplies((prev) => [
        ...prev,
        { text: botReplies[Math.floor(Math.random() * botReplies.length)], isBot: true },
      ]);
    }, 800);
    setChatMessage("");
  };

  return (
    <>
      {/* ─── HERO ── Fullscreen centered, background image overlay ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center bg-[#7c2d12] overflow-hidden">
        {/* Faded world-map SVG watermark */}
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none flex items-center justify-center">
          <Globe className="w-[700px] h-[700px] text-[#faf6f1]" strokeWidth={0.3} />
        </div>

        {/* Subtle vignette rings */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#ea580c]/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-[#ea580c]/5" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 bg-[#ea580c]/15 text-[#ea580c] text-sm font-medium px-4 py-2 rounded-full border border-[#ea580c]/25 mb-6"
          >
            <Zap className="w-4 h-4" />
            Real-time Voyago sync
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-6"
          >
            Travel together.
            <br />
            <span className="text-[#ea580c]">Voyago.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-[#faf6f1]/75 max-w-xl mb-10"
          >
            The simplest platform to plan, collaborate, and share trips with friends and family.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center mb-12"
          >
            <Link
              href="/trips"
              className="inline-flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold px-8 py-3.5 rounded-xl transition shadow-lg hover:shadow-xl text-base"
            >
              Create new trip
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="/explore"
              className="inline-flex items-center gap-2 border border-[#faf6f1]/30 text-[#faf6f1] hover:bg-white/10 font-medium px-8 py-3.5 rounded-xl transition text-base"
            >
              <MapPin className="w-4 h-4" />
              Explore destinations
            </a>
          </motion.div>

          {/* Feature chips row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            {[
              { icon: Plane, label: "Flights" },
              { icon: Users, label: "Groups" },
              { icon: CreditCard, label: "Expenses" },
              { icon: Lock, label: "Private trips" },
              { icon: Calendar, label: "Planning" },
            ].map((chip, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white/5 border border-[#faf6f1]/10 text-[#faf6f1]/70 text-sm px-4 py-2 rounded-full"
              >
                <chip.icon className="w-4 h-4" />
                {chip.label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-[#ea580c]/30 border-2 border-[#7c2d12] flex items-center justify-center text-xs font-bold text-[#faf6f1]"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <span className="text-sm text-[#faf6f1]/70">
            <span className="text-white font-semibold">10,000+</span> travelers already using
          </span>
        </motion.div>
      </section>

      {/* ─── STATS ── Dark terracotta bar spanning full width ─── */}
      <section ref={statsRef} className="bg-[#4a1207] py-10 border-y border-[#ea580c]/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-0 divide-x divide-[#ea580c]/20">
            {[
              { value: counts.trips.toLocaleString() + "+", label: "Trips created", icon: Calendar },
              { value: counts.users.toLocaleString() + "+", label: "Active users", icon: Users },
              { value: counts.countries + "+", label: "Countries", icon: Globe },
              { value: "4.98 ★", label: "Average rating", icon: Star },
              { value: "24/7", label: "Real-time sync", icon: Zap },
              { value: "Free", label: "To start", icon: CheckCircle },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: idx * 0.06, duration: 0.4 }}
                className="flex flex-col items-center px-8 py-2 min-w-[120px]"
              >
                <p className="text-2xl font-bold text-[#ea580c]">{stat.value}</p>
                <p className="text-xs text-[#faf6f1]/50 mt-1 whitespace-nowrap">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DESTINATIONS CAROUSEL ── Comes early, right after stats ─── */}
      <section className="py-24 bg-[#faf6f1]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#ea580c]/10 text-[#ea580c] px-4 py-1 rounded-full text-sm font-medium mb-3">
                <TrendingUp className="w-4 h-4" />
                Trending now
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#7c2d12]">Most popular destinations</h2>
            </div>
            <a href="/explore" className="text-[#ea580c] font-medium text-sm flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Horizontal scrollable cards instead of single-slide carousel */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {destinations.map((dest) => (
                  <div key={dest.id} className="w-full flex-shrink-0">
                    <div className="relative rounded-2xl overflow-hidden shadow-xl group h-[480px]">
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                      {/* Top-left: LIVE badge */}
                      <div className="absolute top-5 left-5 bg-[#ea580c] text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-semibold">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                        </span>
                        LIVE
                      </div>

                      {/* Bottom info */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between">
                        <div className="text-white">
                          <h3 className="text-3xl font-bold mb-1">{dest.name}</h3>
                          <p className="text-white/70 text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {dest.country}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <span className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs text-white flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> {dest.liveTrips} live trips
                          </span>
                          <span className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs text-white flex items-center gap-1.5">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {dest.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition"
            >
              <ChevronLeft className="w-5 h-5 text-[#7c2d12]" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition"
            >
              <ChevronRight className="w-5 h-5 text-[#7c2d12]" />
            </button>

            <div className="flex items-center justify-between mt-5">
              <div className="flex gap-2">
                {destinations.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={cs(
                      "h-2 rounded-full transition-all duration-300",
                      currentSlide === idx ? "w-8 bg-[#ea580c]" : "w-2 bg-[#a8a29e]/30 hover:bg-[#a8a29e]/60"
                    )}
                  />
                ))}
              </div>
              <button
                onClick={() => setAutoplay(!autoplay)}
                className="bg-white border border-[#a8a29e]/20 p-2 rounded-full shadow-sm hover:shadow-md transition"
              >
                {autoplay ? <Pause className="w-4 h-4 text-[#7c2d12]" /> : <Play className="w-4 h-4 text-[#7c2d12]" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ── Horizontal numbered timeline on white ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#ea580c]/10 text-[#ea580c] px-4 py-1 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Simple process
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#7c2d12] mb-3">How it works</h2>
            <p className="text-[#a8a29e] max-w-lg mx-auto">
              In three simple steps, organize the perfect trip with your friends.
            </p>
          </div>

          {/* Timeline row */}
          <div className="relative grid md:grid-cols-3 gap-0">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-[#ea580c] via-[#ea580c]/50 to-[#ea580c]" />

            {[
              {
                icon: Users,
                title: "Create for free",
                desc: "Any user can create a trip at no cost. Add destination, dates, and invite friends.",
                step: "01",
              },
              {
                icon: CreditCard,
                title: "Split expenses",
                desc: "Record shared expenses and see who paid what — transparent and easy.",
                step: "02",
              },
              {
                icon: Lock,
                title: "Public or private",
                desc: "Choose if the trip is open to everyone or invite-only via a code.",
                step: "03",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.12, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center px-8 pt-2 pb-8 group"
              >
                {/* Circle with step number — sits on the line */}
                <div className="relative mb-8 z-10">
                  <div className="w-20 h-20 rounded-full bg-white border-2 border-[#ea580c] flex flex-col items-center justify-center shadow-md group-hover:bg-[#ea580c] transition duration-300">
                    <item.icon className="w-8 h-8 text-[#ea580c] group-hover:text-white transition duration-300" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#ea580c] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#7c2d12] mb-2">{item.title}</h3>
                <p className="text-[#a8a29e] text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link
              href="/trips"
              className="inline-flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold px-8 py-3 rounded-xl transition shadow-md"
            >
              Get started free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── ROADMAP ── 2×2 grid instead of zigzag timeline ─── */}
      <section className="py-24 bg-[#faf6f1]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#ea580c]/10 text-[#ea580c] px-4 py-1 rounded-full text-sm font-medium mb-4">
              <Compass className="w-4 h-4" />
              Your Voyago blueprint
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#7c2d12] mb-3">
              Your guide to the perfect trip
            </h2>
            <p className="text-[#a8a29e] max-w-xl mx-auto">
              Follow these steps and you will have a stress-free organized trip.
            </p>
          </div>

          {/* 2×2 grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {roadmapSteps.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-7 shadow-sm border border-[#a8a29e]/15 hover:shadow-lg transition group flex gap-5 items-start"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[#ea580c]/10 flex items-center justify-center group-hover:bg-[#ea580c] transition">
                  <step.icon className="w-7 h-7 text-[#ea580c] group-hover:text-white transition" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#ea580c] bg-[#ea580c]/10 px-2 py-0.5 rounded-full">
                      Step {step.step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#7c2d12] mb-1">{step.title}</h3>
                  <p className="text-sm text-[#a8a29e] leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ── Two-column layout: left text / right social proof ─── */}
      <section className="relative bg-[#7c2d12] py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full border-[40px] border-[#ea580c]" />
          <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full border-[30px] border-[#ea580c]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Ready to start with Voyago?
              </h2>
              <p className="text-[#faf6f1]/70 text-lg mb-8">
                Join thousands of travelers already using Voyago.
              </p>
              <Link
                href="/trips"
                className="inline-flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white font-semibold text-lg px-10 py-4 rounded-xl transition shadow-lg hover:shadow-xl"
              >
                Create free trip
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            {/* Right: stacked social proof cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col gap-4"
            >
              {[
                {
                  quote: "Finally a trip planner that everyone in our group actually uses!",
                  author: "Arta M.",
                  location: "Prishtinë",
                },
                {
                  quote: "The expense splitting feature saved our friendship on a 2-week trip.",
                  author: "Luka D.",
                  location: "Zagreb",
                },
                {
                  quote: "Real-time sync means no more WhatsApp chaos before trips.",
                  author: "Sara K.",
                  location: "Tiranë",
                },
              ].map((review, i) => (
                <div
                  key={i}
                  className="bg-white/8 border border-[#faf6f1]/10 rounded-2xl p-5 flex items-start gap-4"
                >
                  <div className="w-9 h-9 rounded-full bg-[#ea580c]/30 flex items-center justify-center text-xs font-bold text-[#faf6f1] flex-shrink-0">
                    {review.author[0]}
                  </div>
                  <div>
                    <p className="text-[#faf6f1]/80 text-sm leading-relaxed mb-2">"{review.quote}"</p>
                    <p className="text-xs text-[#faf6f1]/40">
                      {review.author} · {review.location}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CHATBOT BUTTON ─── */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 z-50 bg-[#ea580c] hover:bg-[#c2410c] text-white p-3.5 rounded-full shadow-xl transition hover:scale-105 flex items-center gap-2"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium pr-1 hidden sm:block">Help</span>
      </button>

      {/* ─── CHATBOT MODAL ─── */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setIsChatOpen(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-sm h-[520px] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-[#7c2d12] px-5 py-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#ea580c] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Voyago assistant</p>
                    <p className="text-xs text-[#faf6f1]/60">Always here to help</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 hover:bg-white/15 rounded-full transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-[#faf6f1] space-y-3">
                {chatReplies.map((msg, index) => (
                  <div key={index} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.isBot
                          ? "bg-white shadow-sm text-[#7c2d12] border border-[#a8a29e]/20 rounded-tl-none"
                          : "bg-[#ea580c] text-white rounded-tr-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-[#a8a29e]/15 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                    placeholder="Type your question..."
                    className="flex-1 border border-[#a8a29e]/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c]"
                  />
                  <button
                    onClick={sendChatMessage}
                    className="bg-[#ea580c] text-white p-2.5 rounded-xl hover:bg-[#c2410c] transition flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}