import { useEffect, useState } from "react";
import { NowContext } from "./nowContextValue";

const TICK_MS = 30_000;

/**
 * One clock for the whole app: a single 30-second interval (never one per row), plus an
 * immediate update when the tab becomes visible again so timers aren't stale after a break.
 */
export function NowProvider({ children }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = setInterval(tick, TICK_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <NowContext.Provider value={now}>{children}</NowContext.Provider>;
}
