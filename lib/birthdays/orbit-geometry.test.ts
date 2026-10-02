import { describe, expect, it } from "vitest";
import { addDays, arcPath, dayAngle, daysUntilDate, inLens, monthStarts, polar, shortestTurn } from "./orbit-geometry";

describe("dayAngle", () => {
  it("puts today at the top and runs clockwise round the year", () => {
    expect(dayAngle(0)).toBe(0);
    expect(dayAngle(365)).toBe(0);
    expect(dayAngle(73)).toBeCloseTo(72);
  });

  it("moves with the dial's turn", () => {
    expect(dayAngle(30, 30)).toBe(0);
    expect(dayAngle(0, 30)).toBeCloseTo(330.41, 1);
  });
});

describe("polar", () => {
  it("measures from the top, clockwise", () => {
    const top = polar(100, 100, 50, 0);
    expect(top.x).toBeCloseTo(100);
    expect(top.y).toBeCloseTo(50);
    const right = polar(100, 100, 50, 90);
    expect(right.x).toBeCloseTo(150);
    expect(right.y).toBeCloseTo(100);
  });
});

describe("arcPath", () => {
  it("uses the large-arc flag past half a turn", () => {
    expect(arcPath(0, 0, 10, 0, 90)).toContain(" 0 0 1 ");
    expect(arcPath(0, 0, 10, 0, 270)).toContain(" 0 1 1 ");
  });
});

describe("inLens", () => {
  it("covers the span from the turn, wrapping round the year", () => {
    expect(inLens(0, 0, 30)).toBe(true);
    expect(inLens(29, 0, 30)).toBe(true);
    expect(inLens(30, 0, 30)).toBe(false);
    expect(inLens(5, 350, 30)).toBe(true);
  });
});

describe("monthStarts", () => {
  it("counts days to each coming 1st", () => {
    const starts = monthStarts("2026-10-02");
    expect(starts.find((m) => m.month === 11)?.days).toBe(30);
    expect(starts.find((m) => m.month === 1)?.days).toBe(91);
    // October 1st has passed, so its tick is next October's.
    expect(starts.find((m) => m.month === 10)?.days).toBe(364);
  });
});

describe("helpers", () => {
  it("adds days across months", () => {
    expect(addDays("2026-12-25", 10)).toBe("2027-01-04");
  });

  it("springs back the short way", () => {
    expect(shortestTurn(350, 0)).toBe(15);
    expect(shortestTurn(20, 0)).toBe(-20);
  });
});

describe("daysUntilDate", () => {
  it("counts to the next occurrence, today included", () => {
    expect(daysUntilDate("2026-10-02", 10, 2)).toBe(0);
    expect(daysUntilDate("2026-10-02", 10, 5)).toBe(3);
    expect(daysUntilDate("2026-10-02", 10, 1)).toBe(364);
  });

  it("puts Feb 29 on Feb 28 in a common year", () => {
    expect(daysUntilDate("2026-10-02", 2, 29)).toBe(daysUntilDate("2026-10-02", 2, 28));
    expect(daysUntilDate("2027-10-02", 2, 29)).toBe(daysUntilDate("2027-10-02", 2, 28) + 1);
  });
});
