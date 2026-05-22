import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import type { NotificationItem, JoinedTripSummary } from "@/types";
import { fetchAppShellSnapshot, markAllNotificationsReadRequest } from "@/architecture/client/appShellApi";
import { usePollingResource } from "@/architecture/client/usePollingResource";

type AppShellContextValue = {
  notifications: NotificationItem[];
  joinedTrips: JoinedTripSummary[];
  unreadCount: number;
  refreshAppShell: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
};

const AppShellContext = createContext<AppShellContextValue | null>(null);

const EMPTY_APP_SHELL_STATE = {
  notifications: [] as NotificationItem[],
  joinedTrips: [] as JoinedTripSummary[],
};

type AppShellProviderProps = {
  children: React.ReactNode;
};

export function AppShellProvider({ children }: AppShellProviderProps) {
  const { status } = useSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>(EMPTY_APP_SHELL_STATE.notifications);
  const [joinedTrips, setJoinedTrips] = useState<JoinedTripSummary[]>(EMPTY_APP_SHELL_STATE.joinedTrips);

  const refreshAppShell = useCallback(async () => {
    if (status !== "authenticated") {
      return;
    }

    try {
      const snapshot = await fetchAppShellSnapshot();
      setNotifications(snapshot.notifications);
      setJoinedTrips(snapshot.joinedTrips);
    } catch (error) {
      console.error("Failed to refresh app shell data:", error);
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      const timeoutId = window.setTimeout(() => {
        void refreshAppShell();
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [refreshAppShell, status]);

  usePollingResource(refreshAppShell, {
    enabled: status === "authenticated",
    intervalMs: 30000,
  });

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await markAllNotificationsReadRequest();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  }, []);

  const visibleNotifications = status === "authenticated" ? notifications : EMPTY_APP_SHELL_STATE.notifications;
  const visibleJoinedTrips = status === "authenticated" ? joinedTrips : EMPTY_APP_SHELL_STATE.joinedTrips;

  const value = useMemo<AppShellContextValue>(
    () => ({
      notifications: visibleNotifications,
      joinedTrips: visibleJoinedTrips,
      unreadCount: visibleNotifications.filter((item) => !item.read).length,
      refreshAppShell,
      markAllNotificationsRead,
    }),
    [markAllNotificationsRead, refreshAppShell, visibleJoinedTrips, visibleNotifications]
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

export function useAppShellContext() {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error("useAppShellContext must be used within AppShellProvider");
  }
  return context;
}
