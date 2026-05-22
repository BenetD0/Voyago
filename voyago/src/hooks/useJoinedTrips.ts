import { useMemo } from "react";
import { useAppShell } from "@/hooks/useAppShell";

export function useJoinedTrips() {
  const { joinedTrips, refreshAppShell } = useAppShell();

  return useMemo(
    () => ({
      joinedTrips,
      refreshJoinedTrips: refreshAppShell,
    }),
    [joinedTrips, refreshAppShell]
  );
}
