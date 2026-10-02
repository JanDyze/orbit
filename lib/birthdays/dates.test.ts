import { describe, expect, it } from "vitest";
import { daysSinceLabel, daysUntilLabel, isValidBirthday, localDate, maxDayOfMonth, shortDay, weekday } from "./dates";

describe("birthday validity", () => {
  it("knows how long each month can be", () => {
    expect(maxDayOfMonth(2)).toBe(29);
    expect(maxDayOfMonth(4)).toBe(30);
    expect(maxDayOfMonth(12)).toBe(31);
  });

  it("rejects Apr 31 and Feb 29 in a common year", () => {
    expect(isValidBirthday(4, 31)).toBe(false);
    expect(isValidBirthday(2, 29)).toBe(true);
    expect(isValidBirthday(2, 29, 2024)).toBe(true);
    expect(isValidBirthday(2, 29, 2023)).toBe(false);
    expect(isValidBirthday(13, 1)).toBe(false);
  });
});

describe("labels", () => {
  it("puts days into words", () => {
    expect(daysUntilLabel(0)).toBe("Today");
    expect(daysUntilLabel(1)).toBe("Tomorrow");
    expect(daysUntilLabel(12)).toBe("In 12 days");
    expect(daysSinceLabel(1)).toBe("Yesterday");
    expect(daysSinceLabel(3)).toBe("3 days ago");
  });

  it("formats days", () => {
    expect(shortDay("2027-02-28")).toBe("Feb 28");
    expect(weekday("2026-10-02")).toBe("Friday");
  });

  it("reads today in a time zone", () => {
    // 16:30 UTC on Oct 1 is already Oct 2 in Manila.
    expect(localDate("Asia/Manila", new Date("2026-10-01T16:30:00Z"))).toBe("2026-10-02");
    expect(localDate("UTC", new Date("2026-10-01T16:30:00Z"))).toBe("2026-10-01");
  });
});
