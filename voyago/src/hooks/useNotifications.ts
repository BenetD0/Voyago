import { useMemo } from "react";
import { useAppShell } from "@/hooks/useAppShell";

export function useNotifications() {
  const { notifications, unreadCount, markAllNotificationsRead, refreshAppShell } = useAppShell();

  return useMemo(
    () => ({
      notifications,
      unreadCount,
      markAllNotificationsRead,
      refreshNotifications: refreshAppShell,
    }),
    [markAllNotificationsRead, notifications, refreshAppShell, unreadCount]
  );
}
