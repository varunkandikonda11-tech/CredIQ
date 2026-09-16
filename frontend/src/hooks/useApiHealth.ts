import { useEffect, useState } from "react";
import { apiClient } from "@/api/client";

export function useApiHealth() {
  const configured = Boolean(import.meta.env.VITE_API_URL);
  const [reachable, setReachable] = useState<boolean | null>(configured ? null : false);

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    apiClient.health().then((ok) => {
      if (!cancelled) setReachable(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [configured]);

  return {
    configured,
    down: configured && reachable === false,
  };
}
