import { differenceInCalendarDays, format, isSameYear } from "date-fns";
import { SLA_MINUTES } from "../constants";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Converts a Firestore Timestamp, Date, millis number or `{ seconds }` object to a Date.
 * Returns null for null/undefined and for a pending serverTimestamp() that has no value yet.
 */
export function toDate(value) {
  if (value == null) return null;
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  return null;
}

/** "Just now", "5 min ago", "4:10 PM", "Yesterday 4:10 PM", "Mon 4:10 PM", "12 Nov", "12 Nov 2025". */
export function formatRelative(value, now = Date.now()) {
  const date = toDate(value);
  if (!date) return "";
  const diff = now - date.getTime();

  if (diff < MINUTE) return "Just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} min ago`;

  const daysAgo = differenceInCalendarDays(now, date);
  if (daysAgo === 0) return format(date, "h:mm a");
  if (daysAgo === 1) return `Yesterday ${format(date, "h:mm a")}`;
  if (daysAgo < 7) return format(date, "EEE h:mm a");
  return isSameYear(date, now) ? format(date, "d MMM") : format(date, "d MMM yyyy");
}

/** Clock time for a chat bubble: "4:10 PM". */
export function formatClock(value) {
  const date = toDate(value);
  return date ? format(date, "h:mm a") : "";
}

/** Chat date divider: "Today", "Yesterday", "12 Nov", "12 Nov 2025". */
export function dayLabel(value, now = Date.now()) {
  const date = toDate(value);
  if (!date) return "";
  const daysAgo = differenceInCalendarDays(now, date);
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return isSameYear(date, now) ? format(date, "d MMM") : format(date, "d MMM yyyy");
}

/** Local calendar-day key used to group messages ("2026-11-18"). */
export function dayKey(value) {
  const date = toDate(value);
  return date ? format(date, "yyyy-MM-dd") : "";
}

/** Compact wait duration: "45s", "12m", "1h 12m", "2d 3h". Negative input counts as 0. */
export function formatWait(ms) {
  const safe = Math.max(0, ms);
  if (safe < MINUTE) return `${Math.floor(safe / 1000)}s`;
  if (safe < HOUR) return `${Math.floor(safe / MINUTE)}m`;
  if (safe < DAY) {
    const hours = Math.floor(safe / HOUR);
    const minutes = Math.floor((safe % HOUR) / MINUTE);
    return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  const days = Math.floor(safe / DAY);
  const hours = Math.floor((safe % DAY) / HOUR);
  return hours ? `${days}d ${hours}h` : `${days}d`;
}

/** SLA bucket for a staff wait: "ok" below 15 min, "warn" below 60 min, "breach" after. */
export function slaLevel(ms) {
  if (ms < SLA_MINUTES.WARN * MINUTE) return "ok";
  if (ms < SLA_MINUTES.BREACH * MINUTE) return "warn";
  return "breach";
}

function plural(count, unit) {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}

/** Spoken wait for screen readers: "1 hour 12 minutes", "2 days 3 hours", "less than a minute". */
export function formatWaitLong(ms) {
  const safe = Math.max(0, ms);
  if (safe < MINUTE) return "less than a minute";
  if (safe < HOUR) return plural(Math.floor(safe / MINUTE), "minute");
  if (safe < DAY) {
    const hours = Math.floor(safe / HOUR);
    const minutes = Math.floor((safe % HOUR) / MINUTE);
    return minutes
      ? `${plural(hours, "hour")} ${plural(minutes, "minute")}`
      : plural(hours, "hour");
  }
  const days = Math.floor(safe / DAY);
  const hours = Math.floor((safe % DAY) / HOUR);
  return hours ? `${plural(days, "day")} ${plural(hours, "hour")}` : plural(days, "day");
}

/**
 * Milliseconds from `value` to `now`. A missing value (e.g. a serverTimestamp() still pending)
 * counts as "just now", so a brand-new wait shows 0 instead of nothing.
 */
export function msSince(value, now) {
  const date = toDate(value);
  return date ? Math.max(0, now - date.getTime()) : 0;
}
