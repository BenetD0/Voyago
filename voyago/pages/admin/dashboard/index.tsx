import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  BarChart3,
  Globe,
  Heart,
  Mail,
  Map,
  MessageSquare,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";

type UserRecord = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type ContactRecord = {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: "new" | "read" | "replied";
  createdAt: string;
};

type TripRecord = {
  _id: string;
  name?: string;
  destination: string;
  visibility: "Public" | "Private";
  status: "Done" | "In Progress" | "Cancelled";
  userEmail?: string;
  joinedCount?: number;
};

type OverviewResponse = {
  stats: {
    totalUsers: number;
    totalTrips: number;
    publicTrips: number;
    privateTrips: number;
    activeTrips: number;
    completedTrips: number;
    cancelledTrips: number;
    totalTripMembers: number;
    totalMessages: number;
    totalContacts: number;
    unreadContacts: number;
    totalFavorites: number;
  };
  users: UserRecord[];
  contacts: ContactRecord[];
  recentTrips: TripRecord[];
};

const statCards = [
  { key: "totalUsers", label: "Users", icon: Users, accent: "text-[#22C55E]" },
  { key: "totalTrips", label: "Trips", icon: Map, accent: "text-[#14532D]" },
  { key: "publicTrips", label: "Public Trips", icon: Globe, accent: "text-[#22C55E]" },
  { key: "totalContacts", label: "Contacts", icon: Mail, accent: "text-[#14532D]" },
  { key: "totalFavorites", label: "Favorites", icon: Heart, accent: "text-red-500" },
  { key: "totalMessages", label: "Chat Messages", icon: MessageSquare, accent: "text-[#22C55E]" },
] as const;

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    const user = session?.user as { role?: string } | undefined;
    if (!session || user?.role !== "admin") {
      router.push("/login");
      return;
    }

    fetch("/api/dashboard/admin/overview")
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch admin overview");
        }
        return data;
      })
      .then((data) => setOverview(data))
      .catch((err) => {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to fetch admin overview");
      })
      .finally(() => setLoading(false));
  }, [router, session, status]);

  const newestUsers = useMemo(() => overview?.users.slice(0, 8) ?? [], [overview]);
  const newestContacts = useMemo(() => overview?.contacts.slice(0, 8) ?? [], [overview]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#FAF3E0] via-[#FAF3E0]/60 to-white">
        <p className="text-lg text-[#14532D]">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF3E0] via-[#FAF3E0]/60 to-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-10 w-10 text-[#22C55E]" />
          <div>
            <h1 className="text-3xl font-bold text-[#14532D]">Admin Dashboard</h1>
            <p className="text-[#7C5E3C]">Platform statistics, all users, public/private trip activity, and contact messages.</p>
          </div>
        </div>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        {overview && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {statCards.map((card) => {
                const Icon = card.icon;
                const value = overview.stats[card.key];
                return (
                  <div key={card.key} className="rounded-2xl border border-[#7C5E3C]/15 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#7C5E3C]">{card.label}</p>
                      <Icon className={`h-5 w-5 ${card.accent}`} />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-[#14532D]">{value}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
              <div className="rounded-2xl border border-[#7C5E3C]/15 bg-white p-5 shadow-sm">
                <p className="text-sm text-[#7C5E3C]">Trip Status</p>
                <p className="mt-2 text-xl font-semibold text-[#14532D]">{overview.stats.activeTrips} active</p>
                <p className="mt-1 text-sm text-[#7C5E3C]">{overview.stats.completedTrips} completed, {overview.stats.cancelledTrips} cancelled</p>
              </div>
              <div className="rounded-2xl border border-[#7C5E3C]/15 bg-white p-5 shadow-sm">
                <p className="text-sm text-[#7C5E3C]">Trip Visibility</p>
                <p className="mt-2 text-xl font-semibold text-[#14532D]">{overview.stats.publicTrips} public</p>
                <p className="mt-1 text-sm text-[#7C5E3C]">{overview.stats.privateTrips} private trips</p>
              </div>
              <div className="rounded-2xl border border-[#7C5E3C]/15 bg-white p-5 shadow-sm">
                <p className="text-sm text-[#7C5E3C]">Members in Groups</p>
                <p className="mt-2 text-xl font-semibold text-[#14532D]">{overview.stats.totalTripMembers}</p>
                <p className="mt-1 text-sm text-[#7C5E3C]">Across all trips</p>
              </div>
              <div className="rounded-2xl border border-[#7C5E3C]/15 bg-white p-5 shadow-sm">
                <p className="text-sm text-[#7C5E3C]">Unread Contacts</p>
                <p className="mt-2 text-xl font-semibold text-[#14532D]">{overview.stats.unreadContacts}</p>
                <p className="mt-1 text-sm text-[#7C5E3C]">Messages waiting for review</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-2xl border border-[#7C5E3C]/15 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-[#22C55E]" />
                  <h2 className="text-xl font-semibold text-[#14532D]">All Users</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#7C5E3C]/10 text-left text-xs uppercase tracking-wide text-[#7C5E3C]">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newestUsers.map((user) => (
                        <tr key={user._id} className="border-b border-[#7C5E3C]/10 text-sm text-[#14532D]">
                          <td className="py-3">{user.name}</td>
                          <td className="py-3">{user.email}</td>
                          <td className="py-3">
                            <span className={`rounded-full px-2 py-1 text-xs ${user.role === "admin" ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-[#FAF3E0] text-[#7C5E3C]"}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3">{new Date(user.createdAt).toLocaleDateString("en-GB")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-[#7C5E3C]">Showing the latest {newestUsers.length} of {overview.users.length} users.</p>
              </section>

              <section className="rounded-2xl border border-[#7C5E3C]/15 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#22C55E]" />
                  <h2 className="text-xl font-semibold text-[#14532D]">Recent Trips</h2>
                </div>
                <div className="space-y-3">
                  {overview.recentTrips.map((trip) => (
                    <div key={trip._id} className="rounded-2xl border border-[#7C5E3C]/10 bg-[#FAF3E0]/35 p-4">
                      <p className="font-medium text-[#14532D]">{trip.name || trip.destination}</p>
                      <p className="mt-1 text-sm text-[#7C5E3C]">{trip.userEmail}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#7C5E3C]">
                        <span className="rounded-full bg-white px-3 py-1">{trip.visibility}</span>
                        <span className="rounded-full bg-white px-3 py-1">{trip.status}</span>
                        <span className="rounded-full bg-white px-3 py-1">{trip.joinedCount ?? 0} members</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="mt-8 rounded-2xl border border-[#7C5E3C]/15 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#22C55E]" />
                <h2 className="text-xl font-semibold text-[#14532D]">Contact Messages</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {newestContacts.map((contact) => (
                  <div key={contact._id} className="rounded-2xl border border-[#7C5E3C]/10 bg-[#FAF3E0]/35 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-[#14532D]">{contact.name}</p>
                        <p className="text-sm text-[#7C5E3C]">{contact.email}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs ${contact.status === "new" ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-white text-[#7C5E3C]"}`}>
                        {contact.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-medium text-[#14532D]">{contact.subject || "Contact Form"}</p>
                    <p className="mt-2 text-sm leading-6 text-[#7C5E3C]">{contact.message}</p>
                    <p className="mt-3 text-xs text-[#7C5E3C]/80">{new Date(contact.createdAt).toLocaleString("en-GB")}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-[#7C5E3C]">Showing the latest {newestContacts.length} of {overview.contacts.length} contact messages.</p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
