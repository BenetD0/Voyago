import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trash2, Edit2, MapPin, Users, Calendar, AlertCircle, Loader } from "lucide-react"
import EditTripModal, { type Trip } from "@/components/dashboard/Client/EditTripModal"

export default function AllTrips() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                setIsLoading(true);
                const res = await fetch("/api/dashboard/client/allTrips");
                
                if (!res.ok) {
                    throw new Error("Failed to fetch trips");
                }
                
                const data: Trip[] = await res.json();
                console.log("Fetched trips:", data);
                setTrips(data);
                setError("");
            } catch (err) {
                console.error("Error fetching trips:", err);
                setError("Failed to load trips. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrips();
    }, []);

    // Separat effect për të logjuar kur ndryshon trips


    const formatTripDay = (value: string) =>
        new Date(value).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    const getStatusStyles = (status: Trip["status"]) => {
        const baseStyle = "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium";
        
        switch (status) {
            case "In Progress":
                return `${baseStyle} bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20`;
            case "Done":
                return `${baseStyle} bg-[#14532D]/10 text-[#14532D] border border-[#14532D]/20`;
            case "Cancelled":
                return `${baseStyle} bg-red-100 text-red-700 border border-red-200`;
            default:
                return `${baseStyle} bg-[#FAF3E0] text-[#7C5E3C] border border-[#7C5E3C]/20`;
        }
    };

    async function deleteTrip(tripId: string) {
        const confirmed = window.confirm("Are you sure? This action cannot be undone.");
        if (!confirmed) return;

        setDeletingId(tripId);
        setError("");
        
        try {
            const res = await fetch(`/api/dashboard/client/deleteTrip?id=${tripId}`, {
                method: "DELETE",
            });
            
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to delete trip");
            }

            setTrips((prev) => prev.filter((trip) => trip._id !== tripId));
            console.log("Trip deleted successfully:", data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete trip";
            console.error("Error deleting trip:", err);
            setError(errorMessage);
        } finally {
            setDeletingId(null);
        }
    }

    function handleTripUpdated(updatedTrip: Trip) {
        setTrips((prev) => prev.map((trip) => (trip._id === updatedTrip._id ? updatedTrip : trip)));
        setSelectedTrip(null);
        
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FAF3E0] via-[#FAF3E0]/60 to-white">
            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-[#14532D]">All Trips</h1>
                    <p className="text-[#7C5E3C] text-lg">Manage and monitor all user trips</p>
                </motion.div>

                {/* Error Alert */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-red-800">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-sm text-red-700 hover:text-red-900 mt-2 underline"
                            >
                                Retry
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Loader className="w-12 h-12 text-[#22C55E] animate-spin mx-auto mb-4" />
                            <p className="text-[#7C5E3C]">Loading trips...</p>
                        </div>
                    </div>
                ) : trips.length === 0 ? (
                    /* Empty State */
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white border border-[#7C5E3C]/20 rounded-2xl p-16 text-center shadow-sm"
                    >
                        <MapPin className="w-16 h-16 text-[#7C5E3C]/40 mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold mb-2 text-[#14532D]">No trips found</h3>
                        <p className="text-[#7C5E3C]">Users have not created any trips yet.</p>
                    </motion.div>
                ) : (
                    /* Table */
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white border border-[#7C5E3C]/20 rounded-2xl overflow-hidden shadow-sm"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#FAF3E0]/70 border-b border-[#7C5E3C]/20">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide uppercase text-[#7C5E3C]">Destination</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide uppercase text-[#7C5E3C]">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide uppercase text-[#7C5E3C]">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold tracking-wide uppercase text-[#7C5E3C]">Status</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold tracking-wide uppercase text-[#7C5E3C]">People</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold tracking-wide uppercase text-[#7C5E3C]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#7C5E3C]/10">
                                    {   trips && Array.isArray(trips) && trips.map((trip, index) => (
                                        <motion.tr
                                            key={trip._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-[#FAF3E0]/40 transition-colors cursor-pointer"
                                            onClick={() => setSelectedTrip(trip)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                                                    <span className="font-medium text-[#14532D]">{trip.destination}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[#7C5E3C]">{trip.userEmail}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-[#7C5E3C] flex-shrink-0" />
                                                    <span className="text-[#7C5E3C]">{formatTripDay(trip.tripDay as string)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={getStatusStyles(trip.status)}>
                                                    {trip.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Users className="w-4 h-4 text-[#7C5E3C]" />
                                                    <span className="text-[#14532D] font-medium">{trip.numberOfPeople}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setSelectedTrip(trip)}
                                                        className="p-2 hover:bg-[#22C55E]/10 text-[#7C5E3C] hover:text-[#22C55E] rounded-lg transition-colors"
                                                        title="Edit trip"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => deleteTrip(trip._id)}
                                                        disabled={deletingId === trip._id}
                                                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Delete trip"
                                                    >
                                                        {deletingId === trip._id ? (
                                                            <Loader className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* Stats Footer */}
                {trips.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 flex items-center justify-between text-sm text-[#7C5E3C]"
                    >
                        <span>
                            Total trips: <span className="text-[#14532D] font-semibold">{trips.length}</span>
                        </span>
                        <span>Updated just now</span>
                    </motion.div>
                )}
            </div>

            {/* Modal */}
            <EditTripModal
                isOpen={Boolean(selectedTrip)}
                trip={selectedTrip}
                onClose={() => setSelectedTrip(null)}
                onSaved={handleTripUpdated}
            />
        </div>
    );
}
