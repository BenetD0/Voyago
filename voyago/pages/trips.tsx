import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  Edit2,
  Globe,
  Heart,
  Loader,
  Lock,
  MapPin,
  MessageCircle,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import EditTripModal, { type Trip } from "@/components/dashboard/Client/EditTripModal";

type TripMember = {
  name: string;
  email: string;
  joinedAt?: string;
};

type TripRecord = Trip & {
  userEmail?: string;
  visibility?: "Public" | "Private";
  members?: TripMember[];
  joinedCount?: number;
  isJoined?: boolean;
  isFavorite?: boolean;
};

function getApiErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "message" in data && typeof (data as { message?: unknown }).message === "string") {
    return (data as { message: string }).message;
  }
  return fallback;
}

export default function Trips() {
  const router = useRouter();
  const inviteCode = typeof router.query.invite === "string" ? router.query.invite : "";
  const { data: session, status } = useSession();
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripRecord | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Trip["status"]>("All");

  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = role === "admin";
  const userEmail = session?.user?.email || "";

  const fetchTrips = useCallback(async () => {
    if (status === "loading") return;

    try {
      setIsLoading(true);
      const endpoint = status === "authenticated" ? "/api/dashboard/client/allTrips" : "/api/trips/public";
      const res = await fetch(endpoint);
      const data: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, "Failed to fetch trips"));
      }

      setTrips(Array.isArray(data) ? (data as TripRecord[]) : []);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load trips. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const filteredTrips = useMemo(
    () =>
      trips.filter((trip) => {
        const matchesQuery =
          query.trim().length === 0
            ? true
            : `${trip.name || ""} ${trip.destination || ""}`.toLowerCase().includes(query.trim().toLowerCase());

        const matchesStatus = statusFilter === "All" ? true : trip.status === statusFilter;

        return matchesQuery && matchesStatus;
      }),
    [query, statusFilter, trips]
  );

  const canManageTrip = (trip: TripRecord) => {
    if (isAdmin) return true;
    if (!userEmail) return false;
    return trip.userEmail === userEmail;
  };

  const isTripJoined = (trip: TripRecord) => {
    if (trip.isJoined) return true;
    return Array.isArray(trip.members) ? trip.members.some((member) => member.email === userEmail) : false;
  };

  const joinedCount = (trip: TripRecord) => trip.joinedCount ?? trip.members?.length ?? 0;

  const canOpenDashboard = (trip: TripRecord) => isAdmin || canManageTrip(trip) || isTripJoined(trip);

  const canJoinTrip = (trip: TripRecord) =>
    status === "authenticated" &&
    trip.visibility === "Public" &&
    !canManageTrip(trip) &&
    !isTripJoined(trip) &&
    joinedCount(trip) < (trip.numberOfPeople ?? 0);

  const formatTripDay = (value: string) =>
    new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const getStatusStyles = (tripStatus: Trip["status"]) => {
    const baseStyle = "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium";
    switch (tripStatus) {
      case "In Progress":
        return `${baseStyle} border-[#ea580c]/20 bg-[#ea580c]/10 text-[#ea580c]`;
      case "Done":
        return `${baseStyle} border-[#7c2d12]/20 bg-[#7c2d12]/10 text-[#7c2d12]`;
      case "Cancelled":
        return `${baseStyle} border-red-200 bg-red-100 text-red-700`;
      default:
        return `${baseStyle} border-[#a8a29e]/20 bg-[#faf6f1] text-[#a8a29e]`;
    }
  };

  async function deleteTrip(tripId: string) {
    const confirmed = window.confirm("Are you sure? This action cannot be undone.");
    if (!confirmed) return;

    setDeletingId(tripId);
    setError("");
    try {
      const res = await fetch(`/api/dashboard/client/deleteTrip?id=${tripId}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(getApiErrorMessage(data, "Failed to delete trip"));
      setTrips((prev) => prev.filter((trip) => trip._id !== tripId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete trip");
    } finally {
      setDeletingId(null);
    }
  }

  async function joinTrip(tripId: string) {
    setJoiningId(tripId);
    setError("");
    try {
      const res = await fetch("/api/trips/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, "Failed to join trip"));
      }
      await router.push(`/dashboard/client/trips/${tripId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join trip");
    } finally {
      setJoiningId(null);
    }
  }

  async function toggleFavorite(trip: TripRecord) {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    setFavoriteId(trip._id);
    setError("");
    try {
      const res = await fetch(trip.isFavorite ? `/api/favorites?tripId=${trip._id}` : "/api/favorites", {
        method: trip.isFavorite ? "DELETE" : "POST",
        headers: trip.isFavorite ? undefined : { "Content-Type": "application/json" },
        body: trip.isFavorite ? undefined : JSON.stringify({ tripId: trip._id }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, "Failed to update favorites"));
      }
      setTrips((prev) => prev.map((item) => (item._id === trip._id ? { ...item, isFavorite: !item.isFavorite } : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update favorites");
    } finally {
      setFavoriteId(null);
    }
  }

  async function acceptInvite() {
    if (!inviteCode) return;
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    setInviteLoading(true);
    setError("");
    try {
      const res = await fetch("/api/trips/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, "Failed to accept invite"));
      }
      await router.push(`/dashboard/client/trips/${data.tripId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invite");
    } finally {
      setInviteLoading(false);
    }
  }

  function handleTripUpdated(updatedTrip: Trip) {
    setTrips((prev) => prev.map((trip) => (trip._id === updatedTrip._id ? { ...trip, ...updatedTrip } : trip)));
    setSelectedTrip(null);
  }

  function renderActions(trip: TripRecord) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        {status === "authenticated" && (
          <button
            onClick={() => toggleFavorite(trip)}
            disabled={favoriteId === trip._id}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 text-xs font-medium transition ${
              trip.isFavorite ? "border-red-200 bg-red-50 text-red-600" : "border-[#a8a29e]/20 bg-white text-[#a8a29e]"
            }`}
          >
            <Heart className={`h-4 w-4 ${trip.isFavorite ? "fill-current" : ""}`} />
            {favoriteId === trip._id ? "Saving..." : trip.isFavorite ? "Saved" : "Save"}
          </button>
        )}

        {canOpenDashboard(trip) && (
          <Link
            href={`/dashboard/client/trips/${trip._id}`}
            className="inline-flex items-center gap-1 rounded-full bg-[#7c2d12] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#431407]"
          >
            <MessageCircle className="h-4 w-4" />
            Open dashboard
          </Link>
        )}

        {canJoinTrip(trip) && (
          <button
            onClick={() => joinTrip(trip._id)}
            disabled={joiningId === trip._id}
            className="inline-flex items-center gap-1 rounded-full bg-[#ea580c] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#c2410c] disabled:opacity-50"
          >
            {joiningId === trip._id ? <Loader className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
            {joiningId === trip._id ? "Joining..." : "Join trip"}
          </button>
        )}

        {status === "unauthenticated" && (
          <Link href="/login" className="inline-flex items-center gap-1 rounded-full bg-[#ea580c] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#c2410c]">
            Sign in to join
          </Link>
        )}

        {canManageTrip(trip) && (
          <>
            <button
              onClick={() => setSelectedTrip(trip)}
              className="rounded-full p-2 text-[#a8a29e] transition hover:bg-[#ea580c]/10 hover:text-[#ea580c]"
              title="Edit trip"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => deleteTrip(trip._id)}
              disabled={deletingId === trip._id}
              className="rounded-full p-2 text-[#a8a29e] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              title="Delete trip"
            >
              {deletingId === trip._id ? <Loader className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf6f1] via-[#faf6f1]/60 to-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#7c2d12] sm:text-4xl">{status === "authenticated" ? "Trips" : "Public Trips"}</h1>
            <p className="mt-1 text-[#a8a29e]">
              {status === "authenticated"
                ? "Public trips can be joined, saved to favorites, and opened in a shared dashboard with members and chat."
                : "Browse public trips. Sign in to join a group, chat with members, and save favorites."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTrips}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-full border border-[#a8a29e]/30 bg-white/70 px-4 py-2 text-[#7c2d12] shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
            {status === "authenticated" ? (
              <Link href="/dashboard/client/addTrip" className="inline-flex items-center gap-2 rounded-full bg-[#ea580c] px-5 py-2 text-white shadow-sm transition hover:bg-[#c2410c]">
                <span className="text-sm font-medium">Create trip</span>
              </Link>
            ) : (
              <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-[#ea580c] px-5 py-2 text-white shadow-sm transition hover:bg-[#c2410c]">
                <span className="text-sm font-medium">Sign in</span>
              </Link>
            )}
          </div>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
            <div>
              <p className="font-medium text-red-800">{error}</p>
              <button onClick={() => setError("")} className="mt-1 text-sm text-red-600 underline hover:text-red-800">
                Dismiss
              </button>
            </div>
          </motion.div>
        )}

        {inviteCode && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#7c2d12]/10 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#a8a29e]">Invite detected</p>
              <p className="mt-1 text-[#7c2d12]">You opened an invitation link for a private group. Sign in and accept it to enter the dashboard.</p>
            </div>
            <button onClick={acceptInvite} disabled={inviteLoading} className="rounded-full bg-[#7c2d12] px-5 py-3 text-sm font-medium text-white disabled:opacity-50">
              {inviteLoading ? "Joining..." : "Accept invitation"}
            </button>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a8a29e]/70" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by trip name or destination..."
              className="w-full rounded-full border border-[#a8a29e]/25 bg-white/80 py-2.5 pl-11 pr-4 shadow-sm focus:border-[#ea580c]/40 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/40"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "All" | Trip["status"])}
            className="rounded-full border border-[#a8a29e]/25 bg-white/80 px-4 py-2.5 text-sm text-[#7c2d12] shadow-sm focus:border-[#ea580c]/40 focus:outline-none focus:ring-2 focus:ring-[#ea580c]/40"
          >
            <option value="All">All statuses</option>
            <option value="In Progress">In progress</option>
            <option value="Done">Done</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="mx-auto mb-3 h-10 w-10 animate-spin text-[#ea580c]" />
              <p className="text-[#a8a29e]">Loading trips...</p>
            </div>
          </div>
        ) : filteredTrips.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-[#a8a29e]/20 bg-white p-12 text-center shadow-sm">
            <Globe className="mx-auto mb-4 h-16 w-16 text-[#a8a29e]/40" />
            <h3 className="mb-1 text-xl font-semibold text-[#7c2d12]">No trips found</h3>
            <p className="text-[#a8a29e]">Try a different search or create a new trip.</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredTrips.map((trip) => (
              <div key={trip._id} className="rounded-2xl border border-[#a8a29e]/15 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-[#a8a29e]">Trip</p>
                    <p className="truncate text-lg font-semibold text-[#7c2d12]">{trip.name || trip.destination}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-[#a8a29e]">
                      <MapPin className="h-4 w-4 text-[#ea580c]" />
                      <span className="truncate">{trip.destination}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-[#a8a29e]">
                      <Calendar className="h-4 w-4" />
                      <span>{formatTripDay(trip.tripDay)}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-[#a8a29e]">
                      <Users className="h-4 w-4" />
                      <span>
                        {joinedCount(trip)} / {trip.numberOfPeople ?? 0} members
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={getStatusStyles(trip.status)}>{trip.status === "Done" ? "Completed" : trip.status}</span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#a8a29e]/20 bg-[#faf6f1]/50 px-2.5 py-1 text-xs text-[#a8a29e]">
                      {trip.visibility === "Private" ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                      {trip.visibility || "Public"}
                    </span>
                    {status === "authenticated" && isTripJoined(trip) && !canManageTrip(trip) && (
                      <span className="rounded-full bg-[#ea580c]/10 px-2.5 py-1 text-xs font-medium text-[#ea580c]">Joined</span>
                    )}
                  </div>
                </div>

                {trip.description && <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#a8a29e]">{trip.description}</p>}

                <div className="mt-4 flex flex-col gap-3 border-t border-[#a8a29e]/10 pt-4">
                  <div className="flex flex-wrap gap-2 text-xs text-[#a8a29e]">
                    <span className="rounded-full bg-[#faf6f1] px-3 py-1">Host: {trip.userEmail}</span>
                    <span className="rounded-full bg-[#faf6f1] px-3 py-1">{trip.hour}</span>
                    {trip.visibility === "Public" && <span className="rounded-full bg-[#faf6f1] px-3 py-1">Public group chat enabled</span>}
                  </div>
                  {renderActions(trip)}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {trips.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-sm text-[#a8a29e]">
            Showing <span className="font-semibold text-[#7c2d12]">{filteredTrips.length}</span> of{" "}
            <span className="font-semibold text-[#7c2d12]">{trips.length}</span> trips
          </motion.div>
        )}
      </div>

      <EditTripModal isOpen={Boolean(selectedTrip)} trip={selectedTrip} onClose={() => setSelectedTrip(null)} onSaved={handleTripUpdated} />
    </div>
  );
}
