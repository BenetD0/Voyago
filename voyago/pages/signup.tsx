"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle, Globe } from "lucide-react";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Fjalëkalimet nuk përputhen");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Fjalëkalimi duhet të jetë së paku 6 karaktere");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Ndodhi një gabim");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err) {
      setError("Ndodhi një gabim. Provoni përsëri.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B2E1E] via-[#14532D] to-[#052014] px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Regjistrimi u krye me sukses!</h1>
          <p className="text-gray-600 mb-6">
            Llogaria juaj është krijuar. Po ju ridrejtojmë te faqja e hyrjes...
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#14532D] to-[#22C55E] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition"
          >
            Shko te Hyrja <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900 mt-6">Krijoni llogarinë tuaj</h1>
              <p className="text-gray-600 mt-2">Filloni udhëtimin tuaj me Voyago</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emri i plotë</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#22C55E]/40 focus:border-[#22C55E]/40 transition"
                    placeholder="Emri dhe mbiemri"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmo fjalëkalimin</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#22C55E]/40 focus:border-[#22C55E]/40 transition"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#14532D] to-[#22C55E] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "Duke regjistruar..." : "Regjistrohu"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Keni llogari?{" "}
                <Link href="/login" className="text-[#14532D] hover:text-[#22C55E] font-semibold transition">
                  Hyni këtu
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
