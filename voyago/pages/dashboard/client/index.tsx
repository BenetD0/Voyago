import Sidebar from "@/components/layout/Sidebar"
import { useEffect, useMemo, useState } from "react"

type Trip = {
  _id: string
  status: "Done" | "In Progress" | "Cancelled"
}

export default function ClientDashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/dashboard/client/myTrips")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch trips")
        }
        return res.json()
      })
      .then((data: Trip[]) => setTrips(data))
      .catch((err) => {
        console.error("Error fetching trip statistics:", err)
        setError("Failed to load trip statistics.")
      })
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    const counts = {
      inProgress: 0,
      done: 0,
      cancelled: 0,
    }

    trips.forEach((trip) => {
      if (trip.status === "In Progress") counts.inProgress += 1
      if (trip.status === "Done") counts.done += 1
      if (trip.status === "Cancelled") counts.cancelled += 1
    })

    return counts
  }, [trips])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF3E0] via-[#FAF3E0]/60 to-white">
      <div className="flex min-h-screen">
        <Sidebar role="user" />

        <main className="flex-1 p-8">

          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          {loading ? (
            <p className="text-gray-500">Loading trip statistics...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
                <p className="text-sm text-gray-500">Tripes In Progress</p>
                <p className="mt-2 text-3xl font-bold text-[#22C55E]">{stats.inProgress}</p>
              </div>

              <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
                <p className="text-sm text-gray-500">Tripes Done</p>
                <p className="mt-2 text-3xl font-bold text-green-600">{stats.done}</p>
              </div>

              <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
                <p className="text-sm text-gray-500">Tripes Cancelled</p>
                <p className="mt-2 text-3xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
