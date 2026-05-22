import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import { Calendar, Globe, Lock, Users } from "lucide-react";

type JoinedTrip = {
  _id: string;
  name: string;
  destination: string;
  visibility: "Public" | "Private";
  tripDay: string;
};

export default function JoinedTripsPage() {
  const [trips, setTrips] = useState<JoinedTrip[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/trips/joined")
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch joined trips");
        }
        return data;
      })
      .then((data) => setTrips(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to fetch joined trips");
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF3E0] via-[#FAF3E0]/60 to-white">
      <div className="flex min-h-screen">
        <Sidebar role="user" />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-[#14532D]">Joined Trips</h1>
          <p className="mt-1 text-[#7C5E3C]">Every group you joined lives here for quick access.</p>
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {trips.map((trip) => (
              <Link key={trip._id} href={`/dashboard/client/trips/${trip._id}`} className="rounded-2xl border border-[#7C5E3C]/15 bg-white p-5 shadow-sm transition hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#14532D]">{trip.name}</h2>
                    <p className="mt-1 text-sm text-[#7C5E3C]">{trip.destination}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF3E0] px-3 py-1 text-xs text-[#7C5E3C]">
                    {trip.visibility === "Private" ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                    {trip.visibility}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#7C5E3C]">
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#22C55E]" />
                    {new Date(trip.tripDay).toLocaleDateString("en-GB")}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#22C55E]" />
                    Open group dashboard
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
