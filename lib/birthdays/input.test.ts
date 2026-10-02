import { describe, expect, it } from "vitest";
import { parsePerson } from "./input";

const YEAR = 2026;

describe("parsePerson", () => {
  it("needs only a name, month and day (form fields arrive as strings)", () => {
    expect(parsePerson({ name: " Maria ", birthMonth: "3", birthDay: "4", birthYear: "", nicknames: "", notes: "" }, YEAR)).toEqual({
      ok: true,
      person: { name: "Maria", birthMonth: 3, birthDay: 4, birthYear: null, nicknames: [], notes: null },
    });
  });

  it("takes numbers and optional fields (MCP arguments)", () => {
    const result = parsePerson({ name: "Ben", birthMonth: 12, birthDay: 30, birthYear: 1990, nicknames: ["Benj"] }, YEAR);
    expect(result).toEqual({
      ok: true,
      person: { name: "Ben", birthMonth: 12, birthDay: 30, birthYear: 1990, nicknames: ["Benj"], notes: null },
    });
  });

  it("tidies nicknames typed with commas", () => {
    const result = parsePerson({ name: "Maria Santos", birthMonth: 3, birthDay: 4, nicknames: " Mai ,, mai, Ria,  maria santos " }, YEAR);
    expect(result.ok && result.person.nicknames).toEqual(["Mai", "Ria"]);
  });

  it("rejects a day the month doesn't have", () => {
    const result = parsePerson({ name: "A", birthMonth: 4, birthDay: 31 }, YEAR);
    expect(result).toEqual({ ok: false, errors: { birthDay: "April has only 30 days." } });
  });

  it("allows Feb 29 without a year, or with a leap year, but not a common year", () => {
    expect(parsePerson({ name: "Leap", birthMonth: 2, birthDay: 29 }, YEAR).ok).toBe(true);
    expect(parsePerson({ name: "Leap", birthMonth: 2, birthDay: 29, birthYear: 2000 }, YEAR).ok).toBe(true);
    expect(parsePerson({ name: "Leap", birthMonth: 2, birthDay: 29, birthYear: 1900 }, YEAR)).toEqual({
      ok: false,
      errors: { birthYear: "1900 wasn't a leap year, so it had no February 29." },
    });
    expect(parsePerson({ name: "Feb", birthMonth: 2, birthDay: 30 }, YEAR).ok).toBe(false);
  });

  it("rejects a missing name and a year still to come", () => {
    const result = parsePerson({ name: "  ", birthMonth: "", birthDay: "5", birthYear: "2031" }, YEAR);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.name).toBe("Add a name.");
      expect(result.errors.birthMonth).toBe("Pick a month.");
      expect(result.errors.birthYear).toBe("That year hasn't happened yet.");
    }
  });
});
