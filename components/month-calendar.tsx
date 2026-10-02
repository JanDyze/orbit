"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { weekday } from "@/lib/birthdays/dates";
import { cn } from "@/lib/utils";

export type MonthPerson = {
  personId: string;
  name: string;
  nickname: string | null;
  date: string; // YYYY-MM-DD in this month
  turning: number | null;
  leap: boolean; // a Feb 29 birthday shown on the 28th
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

// A month grid where each birthday is a bead on its day, like the beads on the home dial. Tap a
// day to see just its people; tap it again for the whole month. Swipe the grid sideways for the
// month before or after.
export function MonthCalendar({
  month,
  today,
  people,
  prevHref,
  nextHref,
}: {
  month: string;
  today: string;
  people: MonthPerson[];
  prevHref: string;
  nextHref: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [shift, setShift] = useState(0);
  const swipe = useRef<{ x: number; y: number; active: boolean } | null>(null);
  const swiped = useRef(false);

  function onSwipeDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    swipe.current = { x: e.clientX, y: e.clientY, active: false };
    swiped.current = false;
  }
  function onSwipeMove(e: React.PointerEvent<HTMLDivElement>) {
    const s = swipe.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (!s.active) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.3) {
        s.active = true;
        swiped.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
      } else if (Math.abs(e.clientY - s.y) > 10) swipe.current = null;
      return;
    }
    setShift(dx * 0.35);
  }
  function onSwipeUp(e: React.PointerEvent<HTMLDivElement>) {
    const s = swipe.current;
    swipe.current = null;
    if (!s?.active) return;
    const dx = e.clientX - s.x;
    setShift(0);
    if (Math.abs(dx) > 60) router.push(dx < 0 ? nextHref : prevHref);
  }
  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7)) - 1;
  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

  const byDay = new Map<string, MonthPerson[]>();
  for (const p of people) byDay.set(p.date, [...(byDay.get(p.date) ?? []), p]);

  const shown = selected ? (byDay.get(selected) ?? []) : people;

  return (
    <div className="flex flex-col gap-5">
      <div
        role="group"
        aria-label="Days of the month"
        onPointerDown={onSwipeDown}
        onPointerMove={onSwipeMove}
        onPointerUp={onSwipeUp}
        onPointerCancel={() => {
          swipe.current = null;
          setShift(0);
        }}
        onClickCapture={(e) => {
          if (swiped.current) {
            e.preventDefault();
            e.stopPropagation();
            swiped.current = false;
          }
        }}
        style={{ translate: `${shift}px 0`, transition: shift === 0 ? "translate 0.3s cubic-bezier(0.16, 1, 0.3, 1)" : "none" }}
        className="touch-pan-y rounded-3xl border border-border bg-card p-2"
      >
        <div aria-hidden className="grid grid-cols-7">
          {WEEKDAYS.map((d, i) => (
            <span key={i} className="py-1.5 text-center text-[0.7rem] font-bold text-muted-foreground">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: firstWeekday }, (_, i) => (
            <span key={`pad-${i}`} aria-hidden />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const date = `${month}-${String(i + 1).padStart(2, "0")}`;
            const here = byDay.get(date) ?? [];
            const isToday = date === today;
            const isSelected = date === selected;
            return (
              <button
                key={date}
                type="button"
                aria-pressed={isSelected}
                aria-label={`${i + 1}${here.length ? `: ${here.map((p) => p.name).join(", ")}` : ""}`}
                onClick={() => setSelected(isSelected ? null : date)}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center gap-1 rounded-xl text-sm tabular-nums transition-colors",
                  isSelected ? "bg-primary text-primary-foreground" : here.length ? "bg-sun-soft hover:bg-sun/40" : "hover:bg-muted",
                  isToday && !isSelected && "ring-2 ring-primary ring-inset",
                  here.length ? "font-bold" : "text-muted-foreground",
                )}
              >
                {i + 1}
                {here.length > 0 && (
                  <span className="flex h-1.5 items-center gap-0.5" aria-hidden>
                    {here.slice(0, 3).map((p) => (
                      <span key={p.personId} className={cn("size-1.5 rounded-full", isSelected ? "bg-sun" : "bg-primary")} />
                    ))}
                    {here.length > 3 && <span className="text-[0.55rem] leading-none font-bold">+</span>}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <section aria-labelledby="month-list">
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h2 id="month-list" className="font-brand text-lg font-extrabold tracking-tight">
            {selected ? `${weekday(selected)} ${Number(selected.slice(8, 10))}` : people.length === 1 ? "1 birthday" : `${people.length} birthdays`}
          </h2>
          {selected && (
            <button type="button" onClick={() => setSelected(null)} className="text-sm font-medium text-primary">
              Whole month
            </button>
          )}
        </div>
        {shown.length === 0 ? (
          <p className="rounded-2xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">{selected ? "No birthdays on this day." : "No birthdays this month."}</p>
        ) : (
          <div className="flex flex-col">
            {shown.map((p) => (
              <Link key={p.personId} href={`/people/${p.personId}`} className="flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-muted active:bg-muted">
                <span className="flex w-12 shrink-0 flex-col items-center leading-none">
                  <span className={cn("font-brand text-2xl font-extrabold tabular-nums", p.date === today && "text-primary")}>{Number(p.date.slice(8, 10))}</span>
                  <span className="mt-0.5 text-[0.65rem] font-semibold text-muted-foreground uppercase">{weekday(p.date).slice(0, 3)}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {p.name}
                    {p.nickname && <span className="font-normal text-muted-foreground"> · {p.nickname}</span>}
                  </p>
                  {(p.date === today || p.turning != null || p.leap) && (
                    <p className="truncate text-sm text-muted-foreground">
                      {[p.date === today ? "Today" : null, p.turning != null ? `turns ${p.turning}` : null, p.leap ? "Feb 29 birthday" : null].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" aria-hidden />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
