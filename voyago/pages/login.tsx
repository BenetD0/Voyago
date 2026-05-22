"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Globe } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: session, status } = useSession();
  const router = useRouter();

  // Ridrejto automatikisht nëse është tashmë i kyçur
  useEffect(() => {
    if (status === "authenticated" && session) {
      if (session.user?.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ose fjalëkalimi i gabuar");
      }
      // Ridrejtimi do të bëhet automatikisht nga useEffect pasi session-i të përditësohet
    } catch (err) {
      setError("Ndodhi një gabim. Provoni përsëri.");
    } finally {
      setLoading(false);
    }
  };

  // Nëse është duke u ngarkuar session-i
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B2E1E] via-[#14532D] to-[#052014]">
        <p className="text-white text-xl">Duke kontrolluar...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0B2E1E] via-[#14532D] to-[#052014]">
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2">
                <Globe className="w-8 h-8 text-[#22C55E]" />
                <span className="text-2xl font-black bg-gradient-to-r from-[#14532D] to-[#22C55E] bg-clip-text text-transparent">
                  Voyago
                </span>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mt-6">Mirë se erdhe</h1>
              <p className="text-gray-600 mt-2">Hyni në llogarinë tuaj për të vazhduar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#22C55E]/40 focus:border-[#22C55E]/40 transition"
                    placeholder="email@shembull.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fjalëkalimi</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#22C55E]/40 focus:border-[#22C55E]/40 transition"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href="/reset-password"
                  className="text-sm text-[#14532D] hover:text-[#22C55E] transition"
                >
                  Harruat fjalëkalimin?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#14532D] to-[#22C55E] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "Duke hyrë..." : "Hyni"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Nuk keni llogari?{" "}
                <Link href="/signup" className="text-[#14532D] hover:text-[#22C55E] font-semibold transition">
                  Regjistrohuni
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
