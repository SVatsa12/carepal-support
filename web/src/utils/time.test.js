import { describe, expect, it } from "vitest";
import { dayLabel, formatWait, formatWaitLong, msSince, slaLevel, toDate } from "./time";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("formatWait", () => {
  it.each([
    [0, "0s"],
    [45 * SECOND, "45s"],
    [59 * SECOND + 999, "59s"],
    [MINUTE, "1m"],
    [12 * MINUTE + 30 * SECOND, "12m"],
    [HOUR, "1h"],
    [HOUR + 12 * MINUTE, "1h 12m"],
    [23 * HOUR + 59 * MINUTE, "23h 59m"],
    [DAY, "1d"],
    [2 * DAY + 3 * HOUR + 15 * MINUTE, "2d 3h"],
  ])("formats %i ms as %s", (ms, expected) => {
    expect(formatWait(ms)).toBe(expected);
  });

  it("treats negative durations (clock skew) as zero", () => {
    expect(formatWait(-5 * MINUTE)).toBe("0s");
  });
});

describe("formatWaitLong", () => {
  it.each([
    [30 * SECOND, "less than a minute"],
    [MINUTE, "1 minute"],
    [5 * MINUTE, "5 minutes"],
    [HOUR, "1 hour"],
    [HOUR + 12 * MINUTE, "1 hour 12 minutes"],
    [2 * HOUR + MINUTE, "2 hours 1 minute"],
    [DAY, "1 day"],
    [2 * DAY + 3 * HOUR, "2 days 3 hours"],
  ])("spells out %i ms as %s", (ms, expected) => {
    expect(formatWaitLong(ms)).toBe(expected);
  });
});

describe("slaLevel", () => {
  it.each([
    [0, "ok"],
    [14 * MINUTE + 59 * SECOND, "ok"],
    [15 * MINUTE, "warn"],
    [59 * MINUTE + 59 * SECOND, "warn"],
    [60 * MINUTE, "breach"],
    [3 * DAY, "breach"],
  ])("rates a %i ms wait as %s", (ms, expected) => {
    expect(slaLevel(ms)).toBe(expected);
  });
});

describe("toDate", () => {
  it("accepts Firestore-like timestamps, dates, millis and { seconds }", () => {
    const date = new Date("2026-11-18T10:00:00Z");
    expect(toDate({ toDate: () => date })).toBe(date);
    expect(toDate(date)).toBe(date);
    expect(toDate(date.getTime()).getTime()).toBe(date.getTime());
    expect(toDate({ seconds: date.getTime() / 1000 }).getTime()).toBe(date.getTime());
  });

  it("returns null for missing or pending values", () => {
    expect(toDate(null)).toBeNull();
    expect(toDate(undefined)).toBeNull();
    expect(toDate({})).toBeNull();
  });
});

describe("msSince", () => {
  const now = new Date("2026-11-18T10:00:00Z").getTime();

  it("measures elapsed time", () => {
    expect(msSince(new Date(now - 5 * MINUTE), now)).toBe(5 * MINUTE);
  });

  it("treats a pending serverTimestamp (null) as just now", () => {
    expect(msSince(null, now)).toBe(0);
  });

  it("never goes negative", () => {
    expect(msSince(new Date(now + MINUTE), now)).toBe(0);
  });
});

describe("dayLabel", () => {
  const now = new Date(2026, 10, 18, 15, 0).getTime();

  it("names today and yesterday, then short dates", () => {
    expect(dayLabel(new Date(2026, 10, 18, 0, 5), now)).toBe("Today");
    expect(dayLabel(new Date(2026, 10, 17, 23, 59), now)).toBe("Yesterday");
    expect(dayLabel(new Date(2026, 10, 12, 9, 0), now)).toBe("12 Nov");
    expect(dayLabel(new Date(2025, 10, 12, 9, 0), now)).toBe("12 Nov 2025");
  });
});
