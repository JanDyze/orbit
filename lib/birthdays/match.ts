// Finding the person someone means by a name or nickname ("mark", "Tita Baby", "Mai", "Jonh"),
// for the MCP tools.
// It runs over the user's own people in memory: a personal list is a few hundred names at most.
// Steps, stopping at the first that finds anyone:
//   1. an id
//   2. the whole name or a whole nickname (ignoring case, accents and punctuation)
//   3. every word typed starts a word of the name ("mark s" → "Mark Santos")
//   4. the name contains what was typed
//   5. close spellings, scored like Postgres's pg_trgm
// One hit is the person. More than one is "many", so a write never lands on the wrong Mark.

export type Candidate = { id: string; name: string; nicknames?: string[] };

// Everything a person answers to: their name, then their nicknames.
function namesOf(p: Candidate) {
  return [p.name, ...(p.nicknames ?? [])].map(normalizeName).filter(Boolean);
}

export type MatchResult<T extends Candidate> =
  | { kind: "one"; person: T }
  | { kind: "many"; people: T[] }
  | { kind: "none"; suggestions: T[] };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function normalizeName(name: string) {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function trigrams(text: string) {
  const grams = new Set<string>();
  for (const word of text.split(" ").filter(Boolean)) {
    const padded = `  ${word} `;
    for (let i = 0; i + 3 <= padded.length; i++) grams.add(padded.slice(i, i + 3));
  }
  return grams;
}

// Shared trigrams over all trigrams, 0 to 1, as pg_trgm's similarity().
export function similarity(a: string, b: string) {
  const ga = trigrams(normalizeName(a));
  const gb = trigrams(normalizeName(b));
  if (ga.size === 0 || gb.size === 0) return 0;
  let shared = 0;
  for (const g of ga) if (gb.has(g)) shared++;
  return shared / (ga.size + gb.size - shared);
}

// How close a query is to a person: to a whole name or nickname, or to its best-matching word
// ("jonh" is far from "john dela cruz" as a whole but close to "john").
function closeness(query: string, names: string[]) {
  return Math.max(...names.map((name) => Math.max(similarity(query, name), ...name.split(" ").map((w) => similarity(query, w)))));
}

export const FUZZY_THRESHOLD = 0.4;
const SUGGESTION_THRESHOLD = 0.2;

function pick<T extends Candidate>(hits: T[]): MatchResult<T> | null {
  if (hits.length === 1) return { kind: "one", person: hits[0] };
  if (hits.length > 1) return { kind: "many", people: hits };
  return null;
}

export function matchPerson<T extends Candidate>(query: string, people: T[]): MatchResult<T> {
  const trimmed = query.trim();
  if (UUID.test(trimmed)) {
    const byId = people.find((p) => p.id.toLowerCase() === trimmed.toLowerCase());
    return byId ? { kind: "one", person: byId } : { kind: "none", suggestions: [] };
  }

  const q = normalizeName(trimmed);
  if (!q) return { kind: "none", suggestions: [] };
  const named = people.map((p) => ({ p, names: namesOf(p) }));

  const exact = pick(named.filter(({ names }) => names.includes(q)).map(({ p }) => p));
  if (exact) return exact;

  const qWords = q.split(" ");
  const prefixed = pick(
    named
      .filter(({ names }) =>
        names.some((n) => {
          const words = n.split(" ");
          return qWords.every((qw) => words.some((w) => w.startsWith(qw)));
        }),
      )
      .map(({ p }) => p),
  );
  if (prefixed) return prefixed;

  const contains = pick(named.filter(({ names }) => names.some((n) => n.includes(q))).map(({ p }) => p));
  if (contains) return contains;

  const scored = named
    .map(({ p, names }) => ({ p, score: closeness(q, names) }))
    .sort((a, b) => b.score - a.score);
  const close = pick(scored.filter((s) => s.score >= FUZZY_THRESHOLD).map((s) => s.p));
  if (close) return close;

  return {
    kind: "none",
    suggestions: scored
      .filter((s) => s.score >= SUGGESTION_THRESHOLD)
      .slice(0, 3)
      .map((s) => s.p),
  };
}
