// Inbox headline numbers, computed from the tickets already loaded (pure, unit-testable).

import { msSince } from "./time";

/**
 * - open:        tickets not resolved
 * - waitingOnUs: open tickets whose next reply is owed by staff
 * - longestWaitMs: the longest of those waits (null when nobody is waiting)
 * - csat:        average rating score and how many ratings it is based on (null if none)
 *
 * Average first response is left out: it needs the first staff reply time per ticket, which
 * the ticket document doesn't store.
 */
export function computeInboxStats(tickets, now) {
  let open = 0;
  let waitingOnUs = 0;
  let longestWaitMs = null;
  let ratingSum = 0;
  let ratingCount = 0;

  for (const ticket of tickets) {
    if (ticket.status !== "resolved") {
      open += 1;
      if (ticket.awaitingReplyFrom === "staff") {
        waitingOnUs += 1;
        const waited = msSince(ticket.waitingSince, now);
        if (longestWaitMs === null || waited > longestWaitMs) longestWaitMs = waited;
      }
    }
    const score = ticket.rating?.score;
    if (typeof score === "number") {
      ratingSum += score;
      ratingCount += 1;
    }
  }

  return {
    open,
    waitingOnUs,
    longestWaitMs,
    csat: ratingCount ? { average: ratingSum / ratingCount, count: ratingCount } : null,
  };
}
