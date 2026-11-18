import { describe, expect, it } from "vitest";
import { computeInboxStats } from "./inboxStats";

const MINUTE = 60_000;
const NOW = new Date("2026-11-18T10:00:00Z").getTime();
const ago = (minutes) => new Date(NOW - minutes * MINUTE);

describe("computeInboxStats", () => {
  it("counts open tickets, staff-owed waits, the longest wait and CSAT", () => {
    const stats = computeInboxStats(
      [
        { status: "pending", awaitingReplyFrom: "staff", waitingSince: ago(20), rating: null },
        { status: "in_progress", awaitingReplyFrom: "staff", waitingSince: ago(75), rating: null },
        { status: "in_progress", awaitingReplyFrom: "member", waitingSince: ago(500) },
        { status: "resolved", awaitingReplyFrom: null, waitingSince: null, rating: { score: 5 } },
        { status: "resolved", awaitingReplyFrom: null, waitingSince: null, rating: { score: 4 } },
      ],
      NOW,
    );
    expect(stats).toEqual({
      open: 3,
      waitingOnUs: 2,
      longestWaitMs: 75 * MINUTE,
      csat: { average: 4.5, count: 2 },
    });
  });

  it("returns empty values when nothing is waiting or rated", () => {
    expect(computeInboxStats([], NOW)).toEqual({
      open: 0,
      waitingOnUs: 0,
      longestWaitMs: null,
      csat: null,
    });
  });

  it("treats a pending serverTimestamp as a wait of zero", () => {
    const stats = computeInboxStats(
      [{ status: "pending", awaitingReplyFrom: "staff", waitingSince: null }],
      NOW,
    );
    expect(stats.longestWaitMs).toBe(0);
  });
});
