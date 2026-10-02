"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, LocateFixed } from "lucide-react";
import { BirthdayRowLink } from "@/components/birthday-row";
import { OrbitRing, RING_C as C, RING_R as R, RingBeads } from "@/components/orbit-ring";
import type { BirthdayRow } from "@/lib/birthdays/calendar";
import { MONTHS, shortDay } from "@/lib/birthdays/dates";
import { addDays, arcPath, dayAngle, inLens, monthStarts, normalizeTurn, polar, shortestTurn, YEAR_DAYS } from "@/lib/birthdays/orbit-geometry";
import { cn } from "@/lib/utils";

// The year as one orbit. Today is the flame in the ring's gap; everyone sits on the ring at their
// birthday, clockwise from now. The marigold lens at the top covers 30 days, and turning the dial
// (drag the ring, the arrows, or the arrow keys) moves the year under it; the list below follows.

const SUN = 54;
const LENS_DAYS = 30;
const LENS_DEG = (LENS_DAYS * 360) / YEAR_DAYS;
const HINT_KEY = "orbit-dial-turned";

// Whether the dial's opening animation has played since the app was opened (as BrandMark).
let introPlayed = false;

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const mod = (n: number, m: number) => ((n % m) + m) % m;

// "Drag the ring" shows until the dial has been turned once on this device. Browser storage is only
// a convenience here: without it, the hint just keeps showing.
const noSubscription = () => () => {};
function hasTurnedBefore() {
  try {
    return localStorage.getItem(HINT_KEY) === "1";
  } catch {
    return true;
  }
}

function shortName(row: BirthdayRow) {
  const name = row.nicknames[0] ?? row.name.split(" ")[0];
  return name.length > 13 ? `${name.slice(0, 12)}…` : name;
}

// `compact` when today's or pending cards sit above, so the whole ring still fits the first screen.
export function YearDial({ rows, today, compact = false }: { rows: BirthdayRow[]; today: string; compact?: boolean }) {
  const [turn, setTurn] = useState(0); // days turned forward; fractional while dragging
  const [dragging, setDragging] = useState(false);
  const [intro] = useState(() => !introPlayed);
  const turnedBefore = useSyncExternalStore(noSubscription, hasTurnedBefore, () => true);
  const [turnedNow, setTurnedNow] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ angle: number } | null>(null);
  const frame = useRef(0);
  // The latest turn, for event handlers and the spring animation.
  const turnRef = useRef(0);
  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);

  useEffect(() => {
    introPlayed = true;
    return () => cancelAnimationFrame(frame.current);
  }, []);

  // iOS ignores touch-action on SVG shapes, so a drag that started on the ring stops the page
  // from scrolling here instead.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const stop = (e: TouchEvent) => {
      if (drag.current) e.preventDefault();
    };
    svg.addEventListener("touchmove", stop, { passive: false });
    return () => svg.removeEventListener("touchmove", stop);
  }, []);

  const snapped = mod(Math.round(turn), YEAR_DAYS);

  // Eases the dial to a whole day, the short way round.
  const turnTo = useCallback((target: number) => {
    cancelAnimationFrame(frame.current);
    const from = turnRef.current;
    const distance = shortestTurn(normalizeTurn(from), normalizeTurn(target));
    if (prefersReducedMotion() || Math.abs(distance) < 0.01) {
      setTurn(normalizeTurn(from + distance));
      return;
    }
    const start = performance.now();
    const duration = Math.min(700, 280 + Math.abs(distance) * 3);
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(2, -10 * t); // exponential ease-out
      setTurn(from + distance * (t === 1 ? 1 : eased));
      if (t < 1) frame.current = requestAnimationFrame(step);
      else setTurn(normalizeTurn(from + distance));
    };
    frame.current = requestAnimationFrame(step);
  }, []);

  function rememberTurned() {
    if (turnedNow) return;
    setTurnedNow(true);
    try {
      localStorage.setItem(HINT_KEY, "1");
    } catch {}
  }

  function pointerAngle(e: React.PointerEvent) {
    const rect = svgRef.current!.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    return mod((Math.atan2(y, x) * 180) / Math.PI + 90, 360);
  }

  function onPointerDown(e: React.PointerEvent<SVGPathElement>) {
    cancelAnimationFrame(frame.current);
    drag.current = { angle: pointerAngle(e) };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<SVGPathElement>) {
    if (!drag.current) return;
    const angle = pointerAngle(e);
    const delta = mod(angle - drag.current.angle + 180, 360) - 180;
    drag.current.angle = angle;
    // The ring follows the finger: turning it clockwise brings earlier days under the lens.
    setTurn((t) => t - (delta * YEAR_DAYS) / 360);
  }

  function onPointerUp() {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    if (Math.round(turnRef.current) !== 0) rememberTurned();
    turnTo(Math.round(turnRef.current));
  }

  function turnBy(days: number) {
    rememberTurned();
    turnTo(Math.round(turnRef.current) + days);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const by = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, PageDown: LENS_DAYS, PageUp: -LENS_DAYS }[e.key];
    if (by !== undefined) {
      e.preventDefault();
      turnBy(by);
    } else if (e.key === "Home") {
      e.preventDefault();
      turnTo(0);
    }
  }

  const months = useMemo(() => monthStarts(today), [today]);
  const days = useMemo(() => rows.map((r) => r.daysUntil), [rows]);

  const lensRows = useMemo(
    () =>
      rows
        .filter((r) => inLens(r.daysUntil, snapped, LENS_DAYS))
        .sort((a, b) => mod(a.daysUntil - snapped, YEAR_DAYS) - mod(b.daysUntil - snapped, YEAR_DAYS)),
    [rows, snapped],
  );

  const lensStart = addDays(today, snapped);
  const lensEnd = addDays(today, snapped + LENS_DAYS - 1);
  const atToday = snapped === 0;
  const lensLabel = atToday ? "Next 30 days" : `${shortDay(lensStart)} – ${shortDay(lensEnd)}`;

  // What the sun says. At today, a countdown to the next birthday after today (today's own have
  // their card above the dial); turned, the month under the lens and how many fall in it.
  const todays = rows.filter((r) => r.daysUntil === 0);
  const next = rows.find((r) => r.daysUntil > 0);
  let sunBig: string;
  let sunSmall: string;
  let sunName: string | null = null;
  if (!atToday) {
    sunBig = MONTHS[Number(lensStart.slice(5, 7)) - 1].slice(0, 3);
    sunSmall = lensRows.length === 0 ? "nobody" : lensRows.length === 1 ? "1 birthday" : `${lensRows.length} birthdays`;
  } else if (next) {
    sunBig = String(next.daysUntil);
    sunSmall = next.daysUntil === 1 ? "day until" : "days until";
    sunName = shortName(next);
  } else if (todays.length > 0) {
    sunBig = "Today";
    sunSmall = `${shortName(todays[0])}'s day`;
  } else {
    sunBig = "0";
    sunSmall = "people yet";
  }

  const showHint = !turnedBefore && !turnedNow && rows.length > 0;

  return (
    <section aria-label="Your year" className="flex flex-col">
      <div className={cn("relative mx-auto w-full", compact ? "max-w-[21rem] sm:max-w-[26rem]" : "max-w-[26rem]", intro && "dial-intro")}>
        <svg
          ref={svgRef}
          viewBox="0 0 360 360"
          role="slider"
          tabIndex={0}
          aria-label="Turn the year"
          aria-valuemin={0}
          aria-valuemax={YEAR_DAYS - 1}
          aria-valuenow={snapped}
          aria-valuetext={`${lensLabel}: ${lensRows.length === 1 ? "1 birthday" : `${lensRows.length} birthdays`}`}
          onKeyDown={onKeyDown}
          className="block h-auto w-full touch-pan-y overflow-visible rounded-full outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {/* The lens: the 30 days the list below shows. */}
          <path className="dial-lens" d={arcPath(C, C, R + 13, 0, LENS_DEG)} fill="none" stroke="var(--sun)" strokeWidth={6} strokeLinecap="round" />

          {/* Month ticks and names, outside the ring. */}
          {months.map(({ month, days: offset }) => {
            const a = dayAngle(offset, turn);
            const t1 = polar(C, C, R + 21, a);
            const t2 = polar(C, C, R + 27, a);
            const label = polar(C, C, R + 41, a + 15);
            return (
              <g key={month} className="dial-month">
                <line x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} stroke="var(--muted-foreground)" strokeOpacity={0.5} strokeWidth={1.5} strokeLinecap="round" />
                <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="central" className="fill-muted-foreground font-brand text-[11px] font-bold tracking-wide uppercase">
                  {MONTHS[month - 1].slice(0, 3)}
                </text>
              </g>
            );
          })}

          <OrbitRing turn={turn} glow={todays.length > 0} ringClass="dial-ring" flameClass="dial-flame" />
          <RingBeads days={days} turn={turn} lit={(d) => inLens(d, snapped, LENS_DAYS)} introDelay={intro} />

          {/* The sun, and what it says. */}
          <circle className="dial-sun" cx={C} cy={C} r={SUN} fill="var(--sun)" />
          <text x={C} y={sunName ? C - 10 : C - 6} textAnchor="middle" dominantBaseline="central" className="dial-sun-text fill-sun-foreground font-brand font-extrabold tabular-nums" style={{ fontSize: sunBig.length > 3 ? 26 : 38 }}>
            {sunBig}
          </text>
          <text x={C} y={sunName ? C + 15 : C + 22} textAnchor="middle" dominantBaseline="central" className="dial-sun-text fill-sun-foreground text-[11px] font-medium opacity-80">
            {sunSmall}
          </text>
          {sunName && (
            <text x={C} y={C + 30} textAnchor="middle" dominantBaseline="central" className="dial-sun-text fill-sun-foreground font-brand text-[13px] font-bold">
              {sunName}
            </text>
          )}

          {/* What you drag: a wide invisible band over the ring, so the rest of the page still scrolls. */}
          <path
            d={arcPath(C, C, R - 6, 0, 359.99)}
            fill="none"
            stroke="transparent"
            strokeWidth={70}
            pointerEvents="stroke"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className={cn("touch-none", dragging ? "cursor-grabbing" : "cursor-grab")}
          />
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-1">
        <button
          type="button"
          onClick={() => turnBy(-LENS_DAYS)}
          aria-label="Earlier 30 days"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <h2 className="truncate font-brand text-lg font-extrabold tracking-tight" aria-live="polite">
            {lensLabel}
          </h2>
          {!atToday ? (
            <button
              type="button"
              onClick={() => turnTo(0)}
              className="mx-auto mt-0.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-primary hover:bg-orbit-soft"
            >
              <LocateFixed className="size-3.5" aria-hidden />
              Back to today
            </button>
          ) : (
            showHint && <p className="mt-0.5 text-xs text-muted-foreground">Drag the ring to look further ahead</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => turnBy(LENS_DAYS)}
          aria-label="Later 30 days"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>

      <div className="mt-3 flex flex-col">
        {lensRows.length === 0 ? (
          <p className="rounded-2xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
            {rows.length === 0 ? "Your year is empty. Add someone and they'll appear on the ring." : "No birthdays in these 30 days."}
          </p>
        ) : (
          lensRows.map((row) => <BirthdayRowLink key={row.personId} row={row} />)
        )}
      </div>
    </section>
  );
}
