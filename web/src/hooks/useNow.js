import { useSyncExternalStore } from "react";

// One shared 30-second ticker for every wait timer on screen, instead of an interval per row.
const TICK_MS = 30_000;

let now = Date.now();
let timerId = null;
const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  if (timerId === null) {
    now = Date.now();
    timerId = setInterval(() => {
      now = Date.now();
      listeners.forEach((notify) => notify());
    }, TICK_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timerId);
      timerId = null;
    }
  };
}

function getSnapshot() {
  return now;
}

/** Current time in ms, refreshed every 30 s by a single shared interval. */
export function useNow() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
