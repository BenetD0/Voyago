import Sidebar from "@/components/layout/Sidebar";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, MapPin, Sparkles, User, Wand2 } from "lucide-react";

type ProfileData = {
  name: string;
  email: string;
  bio: string;
  city: string;
  travelStyle: string;
  avatarColor: string;
  profileCompletion: number;
  stats: {
    joinedTrips: number;
    friends: number;
    notifications: number;
  };
  auditLogs: {
    _id: string;
    summary: string;
    createdAt: string;
  }[];
};

const colorOptions = ["#22C55E", "#14532D", "#0EA5E9", "#F97316", "#EF4444"];

export default function ClientProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    city: "",
    travelStyle: "",
    avatarColor: "#22C55E",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/client/getUser")
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load profile");
        }
        return data;
      })
      .then((data) => {
        setProfileData(data);
        setForm({
          name: data.name || "",
          bio: data.bio || "",
          city: data.city || "",
          travelStyle: data.travelStyle || "",
          avatarColor: data.avatarColor || "#22C55E",
        });
      })
      .catch((err) => {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      });
  }, []);

  const completionLabel = useMemo(() => {
    if (!profileData) return "";
    if (profileData.profileCompletion >= 80) return "Profile is looking strong";
    if (profileData.profileCompletion >= 60) return "Nice momentum";
    return "Add a few more details";
  }, [profileData]);

  async function saveProfile() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/dashboard/client/updateProfile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to update profile");
      }

      const refreshed = await fetch("/api/dashboard/client/getUser").then((result) => result.json());
      setProfileData(refreshed);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (!profileData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#FAF3E0] via-[#FAF3E0]/60 to-white">
        <p className="text-lg text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF3E0] via-[#FAF3E0]/60 to-white">
      <div className="flex min-h-screen">
        <Sidebar role="user" />

        <main className="flex-1 p-8">
          <div className="rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.2),_transparent_30%),linear-gradient(135deg,#14532D,#22C55E)] p-8 text-white shadow-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/20 text-4xl font-bold text-white shadow-lg" style={{ backgroundColor: form.avatarColor }}>
                  {profileData.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/70">Traveler Profile</p>
                  <h1 className="text-4xl font-bold">{profileData.name}</h1>
                  <p className="mt-1 text-white/75">{profileData.email}</p>
                </div>
              </div>

              <div className="rounded-3xl bg-white/10 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Sparkles className="h-4 w-4" />
                  {completionLabel}
                </div>
                <div className="mt-3 h-3 w-72 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full rounded-full bg-white transition-all" style={{ width: `${profileData.profileCompletion}%` }} />
                </div>
                <p className="mt-3 text-2xl font-bold">{profileData.profileCompletion}% completed</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-3xl border border-[#7C5E3C]/15 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-[#22C55E]" />
                <h2 className="text-2xl font-semibold text-[#14532D]">Make your profile more fun</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#7C5E3C]">Name</span>
                  <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="w-full rounded-2xl border border-[#7C5E3C]/20 px-4 py-3" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#7C5E3C]">City</span>
                  <input value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} placeholder="Tirana, Prishtina, Rome..." className="w-full rounded-2xl border border-[#7C5E3C]/20 px-4 py-3" />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-[#7C5E3C]">Bio</span>
                  <textarea value={form.bio} onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))} rows={4} placeholder="Tell people how you travel, what you enjoy, and what kind of groups you like." className="w-full rounded-2xl border border-[#7C5E3C]/20 px-4 py-3" />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-[#7C5E3C]">Travel Style</span>
                  <input value={form.travelStyle} onChange={(e) => setForm((prev) => ({ ...prev, travelStyle: e.target.value }))} placeholder="Adventure, foodie, relaxed, backpacking..." className="w-full rounded-2xl border border-[#7C5E3C]/20 px-4 py-3" />
                </label>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-sm font-medium text-[#7C5E3C]">Avatar Color</p>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setForm((prev) => ({ ...prev, avatarColor: color }))}
                      className={`h-10 w-10 rounded-full border-4 ${form.avatarColor === color ? "border-[#14532D]" : "border-transparent"}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
              {success && (
                <p className="mt-4 inline-flex items-center gap-2 text-sm text-[#22C55E]">
                  <CheckCircle2 className="h-4 w-4" />
                  {success}
                </p>
              )}

              <button onClick={saveProfile} disabled={saving} className="mt-6 rounded-full bg-[#22C55E] px-6 py-3 font-semibold text-white disabled:opacity-50">
                {saving ? "Saving..." : "Save profile"}
              </button>
            </section>

            <div className="space-y-6">
              <section className="rounded-3xl border border-[#7C5E3C]/15 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#14532D]">Travel Snapshot</h2>
                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div className="rounded-2xl bg-[#FAF3E0]/50 p-4">
                    <p className="text-sm text-[#7C5E3C]">Joined Trips</p>
                    <p className="mt-1 text-3xl font-bold text-[#14532D]">{profileData.stats.joinedTrips}</p>
                  </div>
                  <div className="rounded-2xl bg-[#FAF3E0]/50 p-4">
                    <p className="text-sm text-[#7C5E3C]">Friends</p>
                    <p className="mt-1 text-3xl font-bold text-[#14532D]">{profileData.stats.friends}</p>
                  </div>
                  <div className="rounded-2xl bg-[#FAF3E0]/50 p-4">
                    <p className="text-sm text-[#7C5E3C]">Unread Notifications</p>
                    <p className="mt-1 text-3xl font-bold text-[#14532D]">{profileData.stats.notifications}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-[#7C5E3C]/15 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[#22C55E]" />
                  <h2 className="text-xl font-semibold text-[#14532D]">Recent Activity</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {profileData.auditLogs.length === 0 ? (
                    <p className="text-sm text-[#7C5E3C]">Your activity log will appear here as you create trips, chat, and connect with people.</p>
                  ) : (
                    profileData.auditLogs.map((item) => (
                      <div key={item._id} className="rounded-2xl bg-[#FAF3E0]/40 p-4">
                        <p className="font-medium text-[#14532D]">{item.summary}</p>
                        <p className="mt-1 text-xs text-[#7C5E3C]">{new Date(item.createdAt).toLocaleString("en-GB")}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-[#7C5E3C]/15 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#22C55E]" />
                  <h2 className="text-xl font-semibold text-[#14532D]">Profile Tips</h2>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-[#7C5E3C]">
                  <li>Add a bio so group members know your vibe.</li>
                  <li>Set a city to make meetups and local trips easier.</li>
                  <li>Choose a travel style to help people connect with you faster.</li>
                </ul>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
