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

// Edits (a letter added, dropped, changed, or two swapped) from a to b: optimal string alignment.
function editDistance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

// How close a typed word is to any word of a person's names, 0 to 1, counting a swapped pair of
// letters as one slip: trigrams see "jonh" as far from "john"; this sees one slip.
function typoCloseness(query: string, names: string[]) {
  return Math.max(...names.flatMap((name) => name.split(" ")).map((w) => 1 - editDistance(query, w) / Math.max(query.length, w.length)));
}

export const FUZZY_THRESHOLD = 0.4;
const SUGGESTION_THRESHOLD = 0.2;

function pick<T extends Candidate>(hits: T[]): MatchResult<T> | null {
  if (hits.length === 1) return { kind: "one", person: hits[0] };
  if (hits.length > 1) return { kind: "many", people: hits };
  return null;
}

// Who a search box shows for what's been typed so far. The same steps as matchPerson, but every
// direct hit at once, best first (whole names, then each word typed starting a word of the name,
// then the name containing it), since the list narrows as you type. Only when nothing hits
// directly does it offer close spellings (`close`), so a typo still finds someone.
export function searchPeople<T extends Candidate>(query: string, people: T[]): { people: T[]; close: boolean } {
  const q = normalizeName(query);
  if (!q) return { people: [], close: false };
  const qWords = q.split(" ");
  const hits: { p: T; tier: number }[] = [];
  for (const p of people) {
    const names = namesOf(p);
    if (names.includes(q)) hits.push({ p, tier: 0 });
    else if (names.some((n) => qWords.every((qw) => n.split(" ").some((w) => w.startsWith(qw))))) hits.push({ p, tier: 1 });
    else if (names.some((n) => n.includes(q))) hits.push({ p, tier: 2 });
  }
  if (hits.length > 0) {
    return { people: hits.sort((a, b) => a.tier - b.tier || a.p.name.localeCompare(b.p.name)).map((h) => h.p), close: false };
  }
  const close = people
    .map((p) => {
      const names = namesOf(p);
      return { p, score: closeness(q, names), typo: typoCloseness(q, names) };
    })
    .filter((s) => s.score >= SUGGESTION_THRESHOLD || s.typo >= 0.75)
    .sort((a, b) => b.score + b.typo - (a.score + a.typo))
    .slice(0, 5)
    .map((s) => s.p);
  return { people: close, close: true };
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
