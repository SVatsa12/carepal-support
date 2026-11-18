import { describe, expect, it } from "vitest";
import {
  DEFAULT_FILTERS,
  countByStatus,
  filterTickets,
  hasNarrowingFilters,
  sortTickets,
} from "./filterTickets";

const MINUTE = 60_000;
const NOW = new Date("2026-11-18T10:00:00Z").getTime();
const ago = (minutes) => new Date(NOW - minutes * MINUTE);

const ME = "uid-rohit";
const MEERA = "uid-meera";

// Synthetic tickets covering every status, priority and assignee case.
const TICKETS = [
  {
    id: "a",
    ticketNo: "TCP-AAAAAA",
    memberName: "Priya Sharma",
    subject: "Nurse arrived late",
    category: "late_nurse",
    priority: "high",
    status: "pending",
    assigneeId: null,
    awaitingReplyFrom: "staff",
    waitingSince: ago(30),
    createdAt: ago(30),
    lastMessageAt: ago(30),
  },
  {
    id: "b",
    ticketNo: "TCP-BBBBBB",
    memberName: "Arjun Mehta",
    subject: "Invoice copy for October",
    category: "billing",
    priority: "low",
    status: "in_progress",
    assigneeId: ME,
    awaitingReplyFrom: "staff",
    waitingSince: ago(90),
    createdAt: ago(300),
    lastMessageAt: ago(90),
  },
  {
    id: "c",
    ticketNo: "TCP-CCCCCC",
    memberName: "Kavya Reddy",
    subject: "Change visit time",
    category: "schedule_change",
    priority: "urgent",
    status: "in_progress",
    assigneeId: MEERA,
    awaitingReplyFrom: "member",
    waitingSince: ago(10),
    createdAt: ago(60),
    lastMessageAt: ago(10),
  },
  {
    id: "d",
    ticketNo: "TCP-DDDDDD",
    memberName: "Rahul Verma",
    subject: "Refund for cancelled visit",
    category: "billing",
    priority: "medium",
    status: "resolved",
    assigneeId: ME,
    awaitingReplyFrom: null,
    waitingSince: null,
    createdAt: ago(2000),
    lastMessageAt: ago(1000),
  },
  {
    id: "e",
    ticketNo: "TCP-EEEEEE",
    memberName: "Ananya Das",
    subject: "App login problem",
    category: "app_issue",
    priority: "urgent",
    status: "pending",
    assigneeId: null,
    awaitingReplyFrom: "staff",
    waitingSince: ago(5),
    createdAt: ago(5),
    lastMessageAt: ago(5),
  },
];

const ids = (tickets) => tickets.map((ticket) => ticket.id);
const run = (filters) => ids(filterTickets(TICKETS, filters, ME));

describe("filterTickets", () => {
  it("defaults to pending tickets, longest waiting first", () => {
    expect(run({})).toEqual(["a", "e"]);
  });

  it("filters by status tab, including all", () => {
    expect(run({ status: "in_progress" })).toEqual(["b", "c"]);
    expect(run({ status: "resolved" })).toEqual(["d"]);
    expect(run({ status: "all" })).toHaveLength(TICKETS.length);
  });

  it("filters by category and priority", () => {
    expect(run({ status: "all", category: "billing" })).toEqual(["b", "d"]);
    expect(run({ status: "all", priority: "urgent" })).toEqual(["e", "c"]);
  });

  it("filters by assignee: me, unassigned or a specific person", () => {
    expect(run({ status: "all", assignee: "me" })).toEqual(["b", "d"]);
    expect(run({ status: "all", assignee: "unassigned" })).toEqual(["a", "e"]);
    expect(run({ status: "all", assignee: MEERA })).toEqual(["c"]);
  });

  it("searches ticket number, member name and subject, ignoring case", () => {
    expect(run({ status: "all", q: "tcp-cccc" })).toEqual(["c"]);
    expect(run({ status: "all", q: "SHARMA" })).toEqual(["a"]);
    expect(run({ status: "all", q: "  invoice " })).toEqual(["b"]);
    expect(run({ status: "all", q: "no such thing" })).toEqual([]);
  });

  it("combines filters", () => {
    expect(run({ status: "all", category: "billing", assignee: "me", q: "refund" })).toEqual(["d"]);
    expect(run({ status: "in_progress", category: "billing", priority: "urgent" })).toEqual([]);
  });

  it("does not mutate the input", () => {
    const before = ids(TICKETS);
    filterTickets(TICKETS, { status: "all", sort: "priority" }, ME);
    expect(ids(TICKETS)).toEqual(before);
  });
});

describe("sortTickets", () => {
  it("waiting: awaiting staff by oldest wait, then the rest by latest activity", () => {
    expect(ids(sortTickets(TICKETS, "waiting"))).toEqual(["b", "a", "e", "c", "d"]);
  });

  it("newest: by creation time", () => {
    expect(ids(sortTickets(TICKETS, "newest"))).toEqual(["e", "a", "c", "b", "d"]);
  });

  it("priority: urgent to low, ties broken by waiting order", () => {
    expect(ids(sortTickets(TICKETS, "priority"))).toEqual(["e", "c", "a", "d", "b"]);
  });

  it("falls back to waiting order for an unknown sort", () => {
    expect(ids(sortTickets(TICKETS, "bogus"))).toEqual(ids(sortTickets(TICKETS, "waiting")));
  });
});

describe("countByStatus", () => {
  it("counts every tab", () => {
    expect(countByStatus(TICKETS, {}, ME)).toEqual({
      pending: 2,
      in_progress: 2,
      resolved: 1,
      all: 5,
    });
  });

  it("respects the other filters but not the status tab", () => {
    expect(countByStatus(TICKETS, { status: "resolved", category: "billing" }, ME)).toEqual({
      pending: 0,
      in_progress: 1,
      resolved: 1,
      all: 2,
    });
  });
});

describe("hasNarrowingFilters", () => {
  it("ignores the status tab and sort", () => {
    expect(hasNarrowingFilters(DEFAULT_FILTERS)).toBe(false);
    expect(hasNarrowingFilters({ status: "all", sort: "newest" })).toBe(false);
  });

  it("is true for category, priority, assignee or search", () => {
    expect(hasNarrowingFilters({ category: "billing" })).toBe(true);
    expect(hasNarrowingFilters({ priority: "low" })).toBe(true);
    expect(hasNarrowingFilters({ assignee: "me" })).toBe(true);
    expect(hasNarrowingFilters({ q: "priya" })).toBe(true);
  });
});
