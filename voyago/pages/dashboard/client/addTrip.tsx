import Sidebar from "@/components/layout/Sidebar";
import { useEffect, useState } from "react";

export default function AddTripPage() {
  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    tripDay: "",
    hour: "",
    description: "",
    numberOfPeople: 5,
    visibility: "Public",
    status: "In Progress",
    userEmail: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/client/getUser")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load current user");
        }
        return res.json();
      })
      .then((data) => {
        setFormData((prev) => ({ ...prev, userEmail: data.email || "" }));
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
        setError("Could not load current user email.");
      });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numberOfPeople" ? Number(value) : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    fetch("/api/dashboard/client/addTrip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.message || "Failed to add trip");
        }
        return data;
      })
      .then(() => {
        alert("Trip added successfully!");
        setFormData((prev) => ({
          ...prev,
          name: "",
          destination: "",
          tripDay: "",
          hour: "",
          description: "",
          numberOfPeople: 5,
          visibility: "Public",
          status: "In Progress",
        }));
      })
      .catch((err) => {
        console.error("Error adding trip:", err);
        setError(err instanceof Error ? err.message : "Failed to add trip. Please try again.");
      })
      .finally(() => setIsSubmitting(false));
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minTripDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(
    tomorrow.getDate()
  ).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF3E0] via-[#FAF3E0]/60 to-white">
      <div className="flex min-h-screen">
        <Sidebar role="user" />
        <main className="flex-1 p-8">
          <h1 className="mb-2 text-2xl font-bold text-[#14532D]">Create a new Trip</h1>
          <p className="mb-6 text-sm text-[#7C5E3C]">
            For public trips, the group limit controls how many members can join, including you.
          </p>

          <form onSubmit={handleSubmit} className="grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Trip Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block h-12 w-full rounded-md border-gray-300 bg-white px-4 shadow-sm focus:border-[#22C55E]/40 focus:ring-[#22C55E]/40 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
                Destination
              </label>
              <input
                type="text"
                name="destination"
                id="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                className="mt-1 block h-12 w-full rounded-md border-gray-300 bg-white px-4 shadow-sm focus:border-[#22C55E]/40 focus:ring-[#22C55E]/40 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="tripDay" className="block text-sm font-medium text-gray-700">
                Trip Date
              </label>
              <input
                type="date"
                name="tripDay"
                id="tripDay"
                value={formData.tripDay}
                min={minTripDate}
                onChange={handleChange}
                required
                className="mt-1 block h-12 w-full rounded-md border-gray-300 bg-white px-4 shadow-sm focus:border-[#22C55E]/40 focus:ring-[#22C55E]/40 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="hour" className="block text-sm font-medium text-gray-700">
                Trip Hour
              </label>
              <input
                type="time"
                name="hour"
                id="hour"
                value={formData.hour}
                onChange={handleChange}
                required
                className="mt-1 block h-12 w-full rounded-md border-gray-300 bg-white px-4 shadow-sm focus:border-[#22C55E]/40 focus:ring-[#22C55E]/40 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="numberOfPeople" className="block text-sm font-medium text-gray-700">
                Group Limit
              </label>
              <input
                type="number"
                name="numberOfPeople"
                id="numberOfPeople"
                min={1}
                value={formData.numberOfPeople}
                onChange={handleChange}
                required
                className="mt-1 block h-12 w-full rounded-md border-gray-300 bg-white px-4 shadow-sm focus:border-[#22C55E]/40 focus:ring-[#22C55E]/40 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block h-12 w-full rounded-md border-gray-300 bg-white px-4 shadow-sm focus:border-[#22C55E]/40 focus:ring-[#22C55E]/40 sm:text-sm"
              >
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="mt-1 block min-h-36 w-full rounded-md border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-[#22C55E]/40 focus:ring-[#22C55E]/40 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                Visibility
              </label>
              <select
                name="visibility"
                id="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="mt-1 block h-12 w-full rounded-md border-gray-300 bg-white px-4 shadow-sm focus:border-[#22C55E]/40 focus:ring-[#22C55E]/40 sm:text-sm"
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>

            {error && <p className="text-sm text-red-500 md:col-span-2">{error}</p>}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-[#22C55E] px-6 py-2 font-semibold text-white transition-colors hover:bg-[#16A34A] disabled:bg-gray-400"
              >
                {isSubmitting ? "Adding..." : "Add Trip"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
