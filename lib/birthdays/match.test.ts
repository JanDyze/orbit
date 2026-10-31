import { describe, expect, it } from "vitest";
import { matchPerson, normalizeName, searchPeople, similarity } from "./match";

const people = [
  { id: "11111111-1111-4111-8111-111111111111", name: "Mark Santos" },
  { id: "22222222-2222-4222-8222-222222222222", name: "Mark Reyes" },
  { id: "33333333-3333-4333-8333-333333333333", name: "Tita Baby", nicknames: ["Babs"] },
  { id: "44444444-4444-4444-8444-444444444444", name: "José Dela Cruz" },
  { id: "55555555-5555-4555-8555-555555555555", name: "John" },
  { id: "66666666-6666-4666-8666-666666666666", name: "Johnny Bravo" },
];

describe("normalizeName", () => {
  it("ignores case, accents and punctuation", () => {
    expect(normalizeName("  José  Dela-Cruz ")).toBe("jose dela cruz");
  });
});

describe("similarity", () => {
  it("is 1 for the same name and low for unrelated ones", () => {
    expect(similarity("Mark", "mark")).toBe(1);
    expect(similarity("Mark", "Baby")).toBeLessThan(0.2);
  });
});

describe("matchPerson", () => {
  it("finds a person by id", () => {
    expect(matchPerson("33333333-3333-4333-8333-333333333333", people)).toEqual({ kind: "one", person: people[2] });
  });

  it("prefers an exact name over longer names that start the same", () => {
    // "John" also starts "Johnny Bravo", but the whole name wins.
    expect(matchPerson("john", people)).toEqual({ kind: "one", person: people[4] });
  });

  it("matches without accents", () => {
    expect(matchPerson("jose dela cruz", people)).toEqual({ kind: "one", person: people[3] });
  });

  it("reports every Mark when the name is ambiguous", () => {
    const result = matchPerson("Mark", people);
    expect(result.kind).toBe("many");
    if (result.kind === "many") expect(result.people.map((p) => p.name)).toEqual(["Mark Santos", "Mark Reyes"]);
  });

  it("narrows by the start of each word", () => {
    expect(matchPerson("mark s", people)).toEqual({ kind: "one", person: people[0] });
    expect(matchPerson("tita", people)).toEqual({ kind: "one", person: people[2] });
  });

  it("matches a part of the name", () => {
    expect(matchPerson("santos", people)).toEqual({ kind: "one", person: people[0] });
  });

  it("forgives a typo when only one name is close", () => {
    expect(matchPerson("Santso", people)).toEqual({ kind: "one", person: people[0] });
  });

  it("finds someone by a nickname, or a typo in one", () => {
    expect(matchPerson("babs", people)).toEqual({ kind: "one", person: people[2] });
    expect(matchPerson("Bbas", people).kind).not.toBe("many");
  });

  it("finds no one for a name that isn't there", () => {
    expect(matchPerson("Zelda", people)).toEqual({ kind: "none", suggestions: [] });
  });
});

describe("searchPeople", () => {
  const names = (query: string) => searchPeople(query, people).people.map((p) => p.name);

  it("shows nobody for an empty search", () => {
    expect(names("  ")).toEqual([]);
  });

  it("puts a whole-name match before names that only start with it", () => {
    expect(names("john")).toEqual(["John", "Johnny Bravo"]);
  });

  it("matches the start of any word, in name order", () => {
    expect(names("mar")).toEqual(["Mark Reyes", "Mark Santos"]);
    expect(names("mark s")).toEqual(["Mark Santos"]);
  });

  it("finds people by nickname, ignoring accents", () => {
    expect(names("babs")).toEqual(["Tita Baby"]);
    expect(names("jose")).toEqual(["José Dela Cruz"]);
  });

  it("finds names containing what was typed", () => {
    expect(names("ela")).toEqual(["José Dela Cruz"]);
  });

  it("offers close spellings only when nothing matches directly", () => {
    expect(searchPeople("mark s", people).close).toBe(false);
    const typo = searchPeople("jonh", people);
    expect(typo.close).toBe(true);
    expect(typo.people[0].name).toBe("John");
    expect(searchPeople("zzzz", people)).toEqual({ people: [], close: true });
  });
});
