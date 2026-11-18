// Pure filtering and sorting for the staff inbox. No React, no Firestore: easy to unit test.

import { toDate } from "./time";

export const STATUS_TABS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "all", label: "All" },
];

export const SORTS = [
  { value: "waiting", label: "Longest waiting" },
  { value: "newest", label: "Newest first" },
  { value: "priority", label: "Priority" },
];

export const DEFAULT_FILTERS = {
  status: "pending",
  category: "all",
  priority: "all",
  assignee: "all",
  q: "",
  sort: "waiting",
};

const PRIORITY_RANK = { urgent: 0, high: 1, medium: 2, low: 3 };

function millis(value) {
  return toDate(value)?.getTime() ?? 0;
}

/** Search is case-insensitive over ticket number, member name and subject. */
function matchesSearch(ticket, q) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return [ticket.ticketNo, ticket.memberName, ticket.subject].some((field) =>
    (field ?? "").toLowerCase().includes(needle),
  );
}

function matchesAssignee(ticket, assignee, currentUid) {
  if (assignee === "all") return true;
  if (assignee === "me") return ticket.assigneeId === currentUid;
  if (assignee === "unassigned") return !ticket.assigneeId;
  return ticket.assigneeId === assignee;
}

/** Every filter except the status tab (the tab counts are computed from this). */
function matchesNonStatus(ticket, filters, currentUid) {
  return (
    (filters.category === "all" || ticket.category === filters.category) &&
    (filters.priority === "all" || ticket.priority === filters.priority) &&
    matchesAssignee(ticket, filters.assignee, currentUid) &&
    matchesSearch(ticket, filters.q)
  );
}

/**
 * "Waiting" order: tickets awaiting staff first, oldest waitingSince first (the longest wait is
 * on top); everything else after, most recent activity first.
 */
function compareWaiting(a, b) {
  const aWaiting = a.awaitingReplyFrom === "staff";
  const bWaiting = b.awaitingReplyFrom === "staff";
  if (aWaiting !== bWaiting) return aWaiting ? -1 : 1;
  if (aWaiting) return millis(a.waitingSince) - millis(b.waitingSince);
  return millis(b.lastMessageAt) - millis(a.lastMessageAt);
}

const COMPARATORS = {
  waiting: compareWaiting,
  newest: (a, b) => millis(b.createdAt) - millis(a.createdAt),
  priority: (a, b) =>
    (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9) || compareWaiting(a, b),
};

/** Returns a new, sorted array. Unknown sort keys fall back to "waiting". */
export function sortTickets(tickets, sort) {
  return [...tickets].sort(COMPARATORS[sort] ?? compareWaiting);
}

/** Applies all filters, then sorts. `currentUid` resolves the "me" assignee filter. */
export function filterTickets(tickets, filters, currentUid) {
  const merged = { ...DEFAULT_FILTERS, ...filters };
  const matching = tickets.filter(
    (ticket) =>
      (merged.status === "all" || ticket.status === merged.status) &&
      matchesNonStatus(ticket, merged, currentUid),
  );
  return sortTickets(matching, merged.sort);
}

/** Counts per status tab, respecting every other active filter. */
export function countByStatus(tickets, filters, currentUid) {
  const merged = { ...DEFAULT_FILTERS, ...filters };
  const counts = { pending: 0, in_progress: 0, resolved: 0, all: 0 };
  for (const ticket of tickets) {
    if (!matchesNonStatus(ticket, merged, currentUid)) continue;
    counts.all += 1;
    if (ticket.status in counts) counts[ticket.status] += 1;
  }
  return counts;
}

/** True when any filter other than the status tab and sort differs from the default. */
export function hasNarrowingFilters(filters) {
  return ["category", "priority", "assignee", "q"].some(
    (key) => (filters[key] ?? DEFAULT_FILTERS[key]) !== DEFAULT_FILTERS[key],
  );
}
