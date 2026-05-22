"use client";

import Link from "next/link";
import { Globe, Heart, Send } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/trips", label: "Trips" },
    { href: "/communitypage", label: "Community" },
    { href: "/contact", label: "Contact" },
    { href: "/about", label: "About" },
  ];

  const legalLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-[#a8a29e]/10 bg-[#431407] text-[#faf6f1]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(234,88,12,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(250,246,241,0.08),_transparent_25%)]" />
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ea580c] to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <Globe className="h-6 w-6 text-[#ea580c]" />
              </div>
              <div>
                <span className="block text-2xl font-bold text-white">
                  Voyago
                </span>
                <span className="text-xs uppercase tracking-[0.25em] text-[#faf6f1]/55">Travel collaboration</span>
              </div>
            </div>
            <p className="max-w-md text-sm leading-7 text-[#faf6f1]/78">
              Plan better group trips, run shared dashboards, chat in real time, and keep every detail synchronized in one professional workspace.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-[#faf6f1]/70 backdrop-blur-sm">
              <Heart className="h-4 w-4 text-rose-400" />
              Built for modern travel teams
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-white/90">Explore</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#faf6f1]/78 transition hover:text-[#ea580c]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-white/90">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#faf6f1]/78 transition hover:text-[#ea580c]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-white/90">Updates</h3>
            <p className="mb-4 text-sm leading-7 text-[#faf6f1]/78">
              Get product updates, travel inspiration, and the latest public trips worth joining.
            </p>
            <form className="rounded-[1.5rem] border border-white/10 bg-white/5 p-2 backdrop-blur-sm">
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Email address"
                  className="rounded-full border border-transparent bg-white/10 px-4 py-3 text-sm text-[#faf6f1] placeholder:text-[#faf6f1]/45 focus:border-[#ea580c]/30 focus:outline-none"
                />
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ea580c] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c2410c]">
                  <Send className="h-4 w-4" />
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-[#faf6f1]/55 md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} Voyago. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="transition hover:text-[#ea580c]">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-[#ea580c]">
              Terms
            </Link>
            <Link href="/cookies" className="transition hover:text-[#ea580c]">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}