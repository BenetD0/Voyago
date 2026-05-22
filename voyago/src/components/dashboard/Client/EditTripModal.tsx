import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";

export type Trip = {
  _id: string;
  name?: string;
  destination: string;
  tripDay: string;
  hour?: string;
  description?: string;
  numberOfPeople?: number;
  status: "Done" | "In Progress" | "Cancelled";
  visibility: "Public" | "Private";
  userEmail?: string;
};

type EditTripModalProps = {
  isOpen: boolean;
  trip: Trip | null;
  onClose: () => void;
  onSaved: (updatedTrip: Trip) => void;
};

type TripFormState = {
  name: string;
  destination: string;
  tripDay: string;
  hour: string;
  description: string;
  numberOfPeople: number;
  status: "Done" | "In Progress" | "Cancelled";
  visibility: "Public" | "Private";
};

const initialState: TripFormState = {
  name: "",
  destination: "",
  tripDay: "",
  hour: "",
  description: "",
  numberOfPeople: 1,
  status: "In Progress",
  visibility: "Public",
};

function toDateInputValue(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(
    2,
    "0"
  )}`;
}

function getTomorrowDateValue() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(
    tomorrow.getDate()
  ).padStart(2, "0")}`;
}

export default function EditTripModal({ isOpen, trip, onClose, onSaved }: EditTripModalProps) {
  const [form, setForm] = useState<TripFormState>(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const minTripDate = getTomorrowDateValue();

  useEffect(() => {
    if (!trip) {
      setForm(initialState);
      return;
    }

    setForm({
      name: trip.name || "",
      destination: trip.destination || "",
      tripDay: toDateInputValue(trip.tripDay),
      hour: trip.hour || "",
      description: trip.description || "",
      numberOfPeople: trip.numberOfPeople || 1,
      status: trip.status,
      visibility: trip.visibility,
    });
    setError("");
  }, [trip]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "numberOfPeople" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trip) {
      return;
    }

    setIsSaving(true);
    setError("");

    if (form.tripDay < minTripDate) {
      setError("Trip date must be from tomorrow onward.");
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/dashboard/client/updateTrip", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: trip._id,
          ...form,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update trip");
      }

      const updatedTrip: Trip = data?.trip || {
        ...trip,
        ...form,
      };

      onSaved(updatedTrip);
      onClose();
    } catch (err) {
      console.error("Error updating trip:", err);
      setError(err instanceof Error ? err.message : "Failed to update trip.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Trip" size="lg">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Trip Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Destination</label>
          <input
            name="destination"
            value={form.destination}
            onChange={handleChange}
            required
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Trip Date</label>
          <input
            type="date"
            name="tripDay"
            value={form.tripDay}
            min={minTripDate}
            onChange={handleChange}
            required
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Hour</label>
          <input type="time" name="hour" value={form.hour} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Group Limit</label>
          <input
            type="number"
            min={1}
            name="numberOfPeople"
            value={form.numberOfPeople}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2">
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={4}
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Visibility</label>
          <select name="visibility" value={form.visibility} onChange={handleChange} className="w-full rounded border border-gray-300 px-3 py-2">
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-500 md:col-span-2">{error}</p>}

        <div className="flex justify-end gap-2 md:col-span-2">
          <button type="button" onClick={onClose} className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded bg-[#22C55E] px-4 py-2 text-white hover:bg-[#16A34A] disabled:bg-gray-400"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
