// Geometry for drawing the year as one orbit: today at the top, the year running clockwise, a
// birthday's place on the ring set by its days-until from the calendar (so the dial never works
// out a birthday date itself). `turn` is how many days the dial has been turned forward.

export const YEAR_DAYS = 365;

const mod = (n: number, m: number) => ((n % m) + m) % m;

// Degrees clockwise from the top for something `days` from today, with the dial turned `turn` days.
export function dayAngle(days: number, turn = 0) {
  return (mod(days - turn, YEAR_DAYS) * 360) / YEAR_DAYS;
}

// A point `r` from the center at `deg` clockwise from the top.
export function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

// An SVG arc clockwise from `fromDeg` to `toDeg` (both clockwise from the top).
export function arcPath(cx: number, cy: number, r: number, fromDeg: number, toDeg: number) {
  const sweep = mod(toDeg - fromDeg, 360) || 360;
  const start = polar(cx, cy, r, fromDeg);
  const end = polar(cx, cy, r, fromDeg + Math.min(sweep, 359.99));
  return `M${start.x.toFixed(2)} ${start.y.toFixed(2)} A${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

// Whether something `days` away falls in the lens: `span` days starting `turn` days from today.
export function inLens(days: number, turn: number, span: number) {
  return mod(days - Math.round(turn), YEAR_DAYS) < span;
}

export function addDays(day: string, n: number) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Days from `today` to the next 1st of each month (0 when today is the 1st), for the month ticks.
export function monthStarts(today: string) {
  const t = Date.parse(`${today}T00:00:00Z`);
  const year = Number(today.slice(0, 4));
  return Array.from({ length: 12 }, (_, i) => {
    let first = Date.UTC(year, i, 1);
    if (first < t) first = Date.UTC(year + 1, i, 1);
    return { month: i + 1, days: Math.round((first - t) / 86_400_000) };
  });
}

// Shortest way round from one turn to another, for springing back to today.
export function shortestTurn(from: number, to: number) {
  const d = mod(to - from, YEAR_DAYS);
  return d > YEAR_DAYS / 2 ? d - YEAR_DAYS : d;
}

export function normalizeTurn(turn: number) {
  return mod(turn, YEAR_DAYS);
}

// Days from `today` to the next `month`/`day` (0 when it's today), for placing a birthday that
// isn't saved yet on the add ring. Feb 29 falls on Feb 28 in common years, as in the SQL; once
// saved, a person's place comes from birthday_calendar() like everyone else's.
export function daysUntilDate(today: string, month: number, day: number) {
  const t = Date.parse(`${today}T00:00:00Z`);
  const on = (year: number) => {
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return Date.UTC(year, month - 1, month === 2 && day === 29 && !leap ? 28 : day);
  };
  const year = Number(today.slice(0, 4));
  const next = on(year) >= t ? on(year) : on(year + 1);
  return Math.round((next - t) / 86_400_000);
}
