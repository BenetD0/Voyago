import Sidebar from "@/components/layout/Sidebar"
import { useState, useEffect } from "react"
import EditTripModal, { type Trip } from "@/components/dashboard/Client/EditTripModal"

export default function MyTrips() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

    useEffect(() => {
        fetch("/api/dashboard/client/myTrips")
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch trips");
                }
                return res.json();
            })
            .then((data: Trip[]) => setTrips(data))
            .catch((err) => {
                console.error("Error fetching trips:", err);
                setError("Failed to load trips.");
            });
    }, []);

    const formatTripDay = (value: string) =>
        new Date(value).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    const getStatusClass = (status: Trip["status"]) => {
        if (status === "In Progress") {
            return "bg-amber-100 text-amber-700";
        }
        if (status === "Done") {
            return "bg-green-100 text-green-700";
        }
        return "bg-red-100 text-red-700";
    };

    async function deleteTrip(tripId: string) {
        const confirmed = window.confirm("Are you sure you want to delete this trip?");
        if (!confirmed) {
            return;
        }

        setDeletingId(tripId);
        setError("");

        try {
            const res = await fetch(`/api/dashboard/client/deleteTrip?id=${tripId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete trip");
            }

            setTrips((prev) => prev.filter((trip) => trip._id !== tripId));
        } catch (err) {
            console.error("Error deleting trip:", err);
            setError("Failed to delete trip.");
        } finally {
            setDeletingId(null);
        }
    }

    function handleTripUpdated(updatedTrip: Trip) {
        setTrips((prev) => prev.map((trip) => (trip._id === updatedTrip._id ? updatedTrip : trip)));
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FAF3E0] via-[#FAF3E0]/60 to-white">
            <div className="flex min-h-screen">
                <Sidebar role="user" />
                <main className="flex-1 p-8">
                    <h1 className="text-2xl font-bold mb-6">My Trips</h1>
                    {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
                    {trips.length === 0 ? (
                        <p className="text-gray-500">You have no trips scheduled.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {trips.map((trip) => (
                                <div key={trip._id} className="bg-white p-6 rounded-lg shadow">
                                    <h2 className="text-xl font-bold mb-2">{trip.name}</h2>
                                    <p className="text-gray-500 mb-2">{formatTripDay(trip.tripDay)}</p>
                                    <p className="mb-2 text-sm text-gray-600">
                                        Status:{" "}
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusClass(trip.status)}`}>
                                            {trip.status}
                                        </span>
                                    </p>
                                    <p className="mb-4 text-sm text-gray-600"><strong>{trip.visibility}</strong></p>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedTrip(trip)}
                                            className="rounded bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => deleteTrip(trip._id)}
                                            disabled={deletingId === trip._id}
                                            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:bg-gray-400"
                                        >
                                            {deletingId === trip._id ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            <EditTripModal
                isOpen={Boolean(selectedTrip)}
                trip={selectedTrip}
                onClose={() => setSelectedTrip(null)}
                onSaved={handleTripUpdated}
            />
        </div>
    );
}
