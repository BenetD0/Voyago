import { useEffect, useEffectEvent } from "react";

type PollingOptions = {
  enabled?: boolean;
  intervalMs?: number;
};

export function usePollingResource(callback: () => void | Promise<void>, options: PollingOptions = {}) {
  const { enabled = true, intervalMs = 3000 } = options;
  const onPoll = useEffectEvent(callback);

  useEffect(() => {
    if (!enabled) return;

    const intervalId = window.setInterval(() => {
      void onPoll();
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [enabled, intervalMs]);
}
