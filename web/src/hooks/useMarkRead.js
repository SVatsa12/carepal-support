import { useEffect, useRef } from "react";
import { markRead } from "../services/messages";

/**
 * Clears the viewer's unread counter while the thread is on screen: on open, whenever new
 * messages raise the count, and when the tab becomes visible again. Skips the write at 0.
 */
export function useMarkRead({ ticketId, side, unreadCount }) {
  const inFlight = useRef(false);

  useEffect(() => {
    if (!ticketId || !unreadCount) return undefined;

    async function clearIfVisible() {
      if (document.visibilityState !== "visible" || inFlight.current) return;
      inFlight.current = true;
      try {
        await markRead({ ticketId, side });
      } catch (error) {
        // Background bookkeeping: the badge simply stays until the next attempt.
        console.error("Mark as read failed", error);
      } finally {
        inFlight.current = false;
      }
    }

    clearIfVisible();
    document.addEventListener("visibilitychange", clearIfVisible);
    return () => document.removeEventListener("visibilitychange", clearIfVisible);
  }, [ticketId, side, unreadCount]);
}
