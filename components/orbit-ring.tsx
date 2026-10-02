import { LOGO_FLAME_BOX, LOGO_FLAME_D } from "@/components/orbit-mark-paths";
import { arcPath, dayAngle, polar, YEAR_DAYS } from "@/lib/birthdays/orbit-geometry";

// The pieces of the year ring that the home dial and the add flow share, so a person sits at the
// same spot on both: today at the top in the gap with the logo's flame, the year clockwise, and
// everyone as beads at their days-until. Drawn in a 360×360 box.

export const RING_C = 180;
export const RING_R = 124;
const GAP_DEG = 20; // the gap the flame sits in, as in the logo (the round caps eat into it)
const GAP_CLEAR_DAYS = 9; // busy-week thickening stops short of the gap on both sides
export const RING_WIDTH = 20;

// The logo's flame, traced (components/orbit-mark-paths.ts), sized for the dial and centered on
// today's spot on the ring.
const FLAME_MID = { x: (LOGO_FLAME_BOX.x0 + LOGO_FLAME_BOX.x1) / 2, y: (LOGO_FLAME_BOX.y0 + LOGO_FLAME_BOX.y1) / 2 };
const FLAME_SCALE = 28 / (LOGO_FLAME_BOX.y1 - LOGO_FLAME_BOX.y0); // about 28 units tall

// The ring, open at today, with the flame in the gap. `glow` when someone's birthday is today.
export function OrbitRing({ turn = 0, glow = false, ringClass, flameClass }: { turn?: number; glow?: boolean; ringClass?: string; flameClass?: string }) {
  const today = dayAngle(0, turn);
  const flame = polar(RING_C, RING_C, RING_R, today);
  return (
    <>
      <path
        className={ringClass}
        d={arcPath(RING_C, RING_C, RING_R, today + GAP_DEG / 2, today - GAP_DEG / 2)}
        pathLength={100}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={RING_WIDTH}
        strokeLinecap="round"
      />
      {glow && <circle className="dial-today-glow" cx={flame.x} cy={flame.y} r={12} fill="var(--sun)" />}
      {/* Placed by the group; the inner group is what animates (a CSS transform would replace the
          placement). */}
      <g transform={`translate(${flame.x} ${flame.y}) rotate(${today}) scale(${FLAME_SCALE * (glow ? 1.25 : 1)}) translate(${-FLAME_MID.x} ${-FLAME_MID.y})`}>
        <path className={flameClass} d={LOGO_FLAME_D} fill="var(--sun)" fillRule="evenodd" />
      </g>
    </>
  );
}

// Everyone on the ring. Birthdays a day or two apart merge into one bead (never wider than a
// week), sized by how many it holds and counted when it's three or more, so beads never fuse into
// blobs; and where a week is busy the ring itself thickens under it, so crowded stretches of the
// year show at a glance.
export function RingBeads({
  days,
  turn = 0,
  lit,
  dim = false,
  introDelay = false,
}: {
  days: number[]; // each person's days until their birthday
  turn?: number;
  lit?: (days: number) => boolean;
  dim?: boolean;
  introDelay?: boolean;
}) {
  const perDay = new Map<number, number>();
  for (const d of days) if (d > 0 && d < YEAR_DAYS) perDay.set(d, (perDay.get(d) ?? 0) + 1);

  const perWeek = new Map<number, number>();
  for (const [d, n] of perDay) perWeek.set(Math.floor(d / 7), (perWeek.get(Math.floor(d / 7)) ?? 0) + n);

  const clusters: { first: number; last: number; total: number; weighted: number }[] = [];
  for (const [d, n] of [...perDay].sort((a, b) => a[0] - b[0])) {
    const c = clusters.at(-1);
    if (c && d - c.last <= 2 && d - c.first <= 6) {
      c.last = d;
      c.total += n;
      c.weighted += d * n;
    } else {
      clusters.push({ first: d, last: d, total: n, weighted: d * n });
    }
  }

  return (
    <g opacity={dim ? 0.35 : 1} className="transition-opacity duration-500">
      {[...perWeek].map(([week, n]) => {
        if (n < 4) return null;
        const from = Math.max(week * 7, GAP_CLEAR_DAYS);
        const to = Math.min(week * 7 + 7, YEAR_DAYS - GAP_CLEAR_DAYS);
        if (to <= from) return null;
        return (
          <path
            key={week}
            className="ring-busy"
            d={arcPath(RING_C, RING_C, RING_R, dayAngle(from, turn), dayAngle(to, turn))}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={RING_WIDTH + Math.min(8, (n - 3) * 2)}
            strokeLinecap="round"
          />
        );
      })}
      {clusters.map((c) => {
        const at = c.weighted / c.total;
        const on = [c.first, c.last].some((d) => lit?.(d) ?? false);
        const p = polar(RING_C, RING_C, RING_R, dayAngle(at, turn));
        const counted = c.total >= 3;
        const r = counted ? Math.min(9.5, 7 + (c.total - 3) * 0.5) : (on ? 5.2 : 4) + (c.total - 1) * 1.1;
        return (
          <g key={c.first} className="dial-bead" style={introDelay ? { animationDelay: `${250 + (dayAngle(at) / 360) * 1100}ms` } : undefined}>
            <circle cx={p.x} cy={p.y} r={r} fill={on ? "var(--sun)" : "var(--background)"} />
            {counted && (
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" className="fill-primary font-brand text-[9px] font-extrabold tabular-nums">
                {c.total}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
