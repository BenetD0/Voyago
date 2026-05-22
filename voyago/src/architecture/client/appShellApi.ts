import type { JoinedTripSummary, NotificationItem } from "@/types";
import { fetchJson } from "@/architecture/client/fetchJson";

export type AppShellSnapshot = {
  notifications: NotificationItem[];
  joinedTrips: JoinedTripSummary[];
};

export async function fetchAppShellSnapshot(): Promise<AppShellSnapshot> {
  const [notifications, joinedTrips] = await Promise.all([
    fetchJson<NotificationItem[]>("/api/notifications"),
    fetchJson<JoinedTripSummary[]>("/api/trips/joined"),
  ]);

  return {
    notifications,
    joinedTrips,
  };
}

export async function markAllNotificationsReadRequest() {
  await fetchJson<{ message: string }>("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ readAll: true }),
  });
}
