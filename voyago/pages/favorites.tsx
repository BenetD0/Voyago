import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Calendar, Heart, Loader, MapPin, Trash2, Users } from "lucide-react";

type FavoriteTripItem = {
  _id: string;
  tripId: string;
  trip: {
    _id: string;
    name?: string;
    destination: string;
    tripDay: string;
    hour?: string;
    description?: string;
    numberOfPeople?: number;
    visibility: "Public" | "Private";
    userEmail?: string;
    joinedCount?: number;
    isJoined?: boolean;
  };
};

export default function FavoritesPage() {
  const router = useRouter();
  const { status } = useSession();
  const [items, setItems] = useState<FavoriteTripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status !== "authenticated") return;

    fetch("/api/favorites")
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch favorite trips");
        }
        return data;
      })
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to fetch favorite trips");
      })
      .finally(() => setLoading(false));
  }, [router, status]);

  async function removeFavorite(tripId: string) {
    setRemovingId(tripId);
    setError("");
    try {
      const res = await fetch(`/api/favorites?tripId=${tripId}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to remove favorite");
      }
      setItems((prev) => prev.filter((item) => item.tripId !== tripId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove favorite");
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#FAF3E0] via-[#FAF3E0]/60 to-white">
        <Loader className="h-8 w-8 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF3E0] via-[#FAF3E0]/60 to-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#14532D]">Favorite Trips</h1>
          <p className="mt-1 text-[#7C5E3C]">Trips you saved for later.</p>
        </div>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        {items.length === 0 ? (
          <div className="rounded-2xl border border-[#7C5E3C]/20 bg-white p-12 text-center shadow-sm">
            <Heart className="mx-auto mb-4 h-14 w-14 text-[#7C5E3C]/35" />
            <h2 className="text-xl font-semibold text-[#14532D]">No saved trips yet</h2>
            <p className="mt-2 text-[#7C5E3C]">Browse public trips and save the ones you want to keep an eye on.</p>
            <Link href="/trips" className="mt-6 inline-flex rounded-full bg-[#22C55E] px-5 py-2 text-sm font-medium text-white hover:bg-[#16A34A]">
              Explore trips
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {items.map((item) => (
              <div key={item._id} className="rounded-2xl border border-[#7C5E3C]/15 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-[#14532D]">{item.trip.name || item.trip.destination}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-[#7C5E3C]">
                      <MapPin className="h-4 w-4 text-[#22C55E]" />
                      <span>{item.trip.destination}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-[#7C5E3C]">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(item.trip.tripDay).toLocaleDateString("en-GB")}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-[#7C5E3C]">
                      <Users className="h-4 w-4" />
                      <span>
                        {item.trip.joinedCount ?? 0} / {item.trip.numberOfPeople ?? 0} members
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFavorite(item.tripId)}
                    disabled={removingId === item.tripId}
                    className="rounded-full p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    title="Remove from favorites"
                  >
                    {removingId === item.tripId ? <Loader className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>

                {item.trip.description && <p className="mt-4 text-sm leading-6 text-[#7C5E3C]">{item.trip.description}</p>}

                <div className="mt-4 flex gap-2">
                  <Link href="/trips" className="rounded-full border border-[#7C5E3C]/20 px-4 py-2 text-sm text-[#7C5E3C] hover:bg-[#FAF3E0]">
                    Back to trips
                  </Link>
                  {item.trip.isJoined ? (
                    <Link href={`/dashboard/client/trips/${item.tripId}`} className="rounded-full bg-[#14532D] px-4 py-2 text-sm text-white hover:bg-[#0f3d26]">
                      Open dashboard
                    </Link>
                  ) : (
                    <Link href="/trips" className="rounded-full bg-[#14532D] px-4 py-2 text-sm text-white hover:bg-[#0f3d26]">
                      Open in trips
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
