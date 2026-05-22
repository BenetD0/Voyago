"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Heart,
  LogOut,
  Menu,
  MessageSquare,
  User,
  X,
  Globe,
  Compass,
  ChevronRight,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export default function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { notifications, unreadCount, markAllNotificationsRead } = useNotifications();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/trips", label: "Trips" },
    { href: "/communitypage", label: "Community" },
    { href: "/contact", label: "Contact" },
    { href: "/about", label: "About" },
  ];

  const role = (session?.user as { role?: string } | undefined)?.role;

  function getNotificationHref(item: (typeof notifications)[number]) {
    if (item.data?.tripId) {
      return `/dashboard/client/trips/${item.data.tripId}`;
    }
    if (item.data?.friendEmail) {
      return `/dashboard/client/messages?friend=${encodeURIComponent(item.data.friendEmail)}`;
    }
    return "/dashboard/client";
  }

  return (
    <>
      {/* GLASSMORPHISM FLOATING NAVBAR */}
      <header
        className={`fixed left-0 right-0 top-4 z-50 mx-auto max-w-6xl px-4 transition-all duration-500 ${
          scrolled ? "top-2" : "top-4"
        }`}
      >
        <div
          className={`flex items-center justify-between rounded-2xl px-5 py-3 backdrop-blur-xl transition-all duration-500 ${
            scrolled
              ? "bg-white/80 shadow-lg border border-[#a8a29e]/10"
              : "bg-white/40 shadow-md border border-white/20"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ea580c] text-white shadow-sm">
              <Globe className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#7c2d12]">
              Voy<span className="text-[#ea580c]">ago</span>
            </span>
          </Link>

          {/* Desktop Nav - Centered Pill Links */}
          <nav className="hidden items-center gap-1 rounded-full bg-[#faf6f1]/60 p-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-[#a8a29e] transition-all hover:bg-white hover:text-[#7c2d12] hover:shadow-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/favorites"
              className="hidden rounded-full p-2.5 text-[#a8a29e] transition hover:bg-[#faf6f1] hover:text-red-500 md:block"
              aria-label="Favorites"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {session && (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setNotificationOpen((prev) => !prev)}
                  className="relative rounded-full p-2.5 text-[#a8a29e] transition hover:bg-[#faf6f1]"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ea580c] text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notificationOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-14 z-50 w-80 rounded-2xl border border-[#a8a29e]/10 bg-white/95 p-4 shadow-2xl backdrop-blur-xl"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#7c2d12]">Notifications</p>
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-xs text-[#ea580c] hover:underline"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-80 space-y-2 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-sm text-[#a8a29e]">No notifications yet.</p>
                        ) : (
                          notifications.map((item) => (
                            <Link
                              key={item._id}
                              href={getNotificationHref(item)}
                              onClick={() => setNotificationOpen(false)}
                              className={`block rounded-xl border px-3 py-3 text-sm transition hover:shadow-sm ${
                                item.read
                                  ? "border-[#a8a29e]/10 bg-[#faf6f1]/35"
                                  : "border-[#ea580c]/20 bg-[#ea580c]/5"
                              }`}
                            >
                              <p className="font-medium text-[#7c2d12]">{item.title}</p>
                              <p className="mt-1 text-xs text-[#a8a29e]">{item.body}</p>
                            </Link>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {session ? (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  href={role === "admin" ? "/admin/dashboard" : "/dashboard/client"}
                  className="rounded-full bg-[#ea580c]/10 px-4 py-2 text-sm font-semibold text-[#ea580c] transition hover:bg-[#ea580c] hover:text-white"
                >
                  Dashboard
                </Link>

                <div className="h-6 w-px bg-[#a8a29e]/20" />

                <button
                  onClick={() => signOut({ callbackUrl: "/", redirect: true })}
                  className="rounded-full p-2.5 text-[#a8a29e] transition hover:bg-red-50 hover:text-red-500"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  href="/signup"
                  className="rounded-full px-4 py-2 text-sm font-medium text-[#a8a29e] transition hover:bg-[#faf6f1] hover:text-[#7c2d12]"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  className="rounded-full bg-[#ea580c] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c2410c] hover:shadow-md"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-full p-2.5 text-[#7c2d12] transition hover:bg-[#faf6f1] md:hidden"
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* FULLSCREEN MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-[#faf6f1]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ea580c] text-white">
                  <Globe className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold text-[#7c2d12]">
                  Voyago<span className="text-[#ea580c]">Sync</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full bg-[#7c2d12] p-3 text-white transition hover:bg-[#431407]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-col px-6 pt-8">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 + 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center justify-between rounded-2xl px-5 py-4 text-2xl font-bold text-[#7c2d12] transition hover:bg-white hover:shadow-md"
                    >
                      {link.label}
                      <ChevronRight className="h-6 w-6 text-[#a8a29e] transition group-hover:translate-x-1 group-hover:text-[#ea580c]" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {session && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 flex flex-col gap-2 border-t border-[#a8a29e]/10 pt-6"
                >
                  <Link
                    href="/dashboard/client"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-5 py-4 text-lg font-semibold text-[#7c2d12] transition hover:bg-white hover:shadow-md"
                  >
                    <Compass className="h-6 w-6 text-[#ea580c]" />
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/client/messages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-5 py-4 text-lg font-semibold text-[#7c2d12] transition hover:bg-white hover:shadow-md"
                  >
                    <MessageSquare className="h-6 w-6 text-[#ea580c]" />
                    Messages
                  </Link>
                </motion.div>
              )}

              {/* Bottom Actions */}
              <div className="mt-auto px-6 pb-8 pt-6">
                {!session ? (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ea580c] py-4 text-lg font-bold text-white shadow-lg transition hover:bg-[#c2410c]"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#a8a29e]/20 py-4 text-lg font-bold text-[#7c2d12] transition hover:bg-white"
                    >
                      Create Account
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ea580c]/10">
                      <User className="h-6 w-6 text-[#ea580c]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#7c2d12]">{session.user?.name}</p>
                      <p className="text-sm text-[#a8a29e]">{session.user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: "/", redirect: true });
                        setMobileMenuOpen(false);
                      }}
                      className="rounded-full bg-red-50 p-3 text-red-500 transition hover:bg-red-100"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}