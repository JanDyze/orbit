"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MONTHS } from "@/lib/birthdays/dates";
import { tick } from "@/lib/sound";
import { cn } from "@/lib/utils";

export type StripMonth = { count: number; names: string[] };

// The year at a glance: each month's initial over a bar as tall as its share of birthdays. Hover
// with a mouse, or press and slide with a finger, to scrub across the months: a bubble previews
// the month under you (how many, and who), ticking as you pass each one; let go to open it.
export function MonthStrip({ year, month, months }: { year: number; month: number; months: StripMonth[] }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const previewRef = useRef<number | null>(null);
  const scrubbing = useRef(false);
  const handled = useRef(false);
  const busiest = Math.max(1, ...months.map((m) => m.count));
  const href = (i: number) => `/calendar?m=${year}-${String(i + 1).padStart(2, "0")}`;

  function indexAt(clientX: number) {
    const rect = ref.current!.getBoundingClientRect();
    return Math.max(0, Math.min(11, Math.floor(((clientX - rect.left) / rect.width) * 12)));
  }

  function show(i: number | null) {
    if (previewRef.current === i) return;
    if (i !== null && previewRef.current !== null && scrubbing.current) tick("day");
    previewRef.current = i;
    setPreview(i);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    scrubbing.current = true;
    handled.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
    show(indexAt(e.clientX));
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (scrubbing.current || e.pointerType === "mouse") show(indexAt(e.clientX));
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!scrubbing.current) return;
    scrubbing.current = false;
    handled.current = true;
    const i = indexAt(e.clientX);
    if (e.pointerType !== "mouse") show(null);
    if (i + 1 !== month) router.push(href(i));
  }

  function onPointerCancel() {
    scrubbing.current = false; // the page scrolled instead
    show(null);
  }

  const shown = preview;

  return (
    <div className="relative mb-5">
      {shown !== null && (
        <div
          role="status"
          className="pointer-events-none absolute top-full z-40 mt-2 w-max max-w-[15rem] -translate-x-1/2 rounded-2xl bg-foreground px-3.5 py-2 text-background shadow-lg"
          style={{ left: `clamp(7rem, ${((shown + 0.5) / 12) * 100}%, calc(100% - 7rem))` }}
        >
          <p className="font-brand text-base font-extrabold">
            {MONTHS[shown]} <span className="font-sans text-sm font-medium opacity-75">· {months[shown].count === 1 ? "1 birthday" : `${months[shown].count} birthdays`}</span>
          </p>
          {months[shown].names.length > 0 && (
            <p className="truncate text-xs opacity-75">
              {months[shown].names.join(", ")}
              {months[shown].count > months[shown].names.length && ` +${months[shown].count - months[shown].names.length}`}
            </p>
          )}
        </div>
      )}
      <nav
        ref={ref}
        aria-label="Months"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={(e) => e.pointerType === "mouse" && !scrubbing.current && show(null)}
        className="grid touch-pan-y grid-cols-12 gap-1 select-none"
      >
        {MONTHS.map((name, i) => {
          const current = i + 1 === month;
          const hot = shown === i;
          return (
            <Link
              key={name}
              href={href(i)}
              draggable={false}
              onClick={(e) => {
                // A press already navigated (or stayed) on release.
                if (handled.current) e.preventDefault();
                handled.current = false;
              }}
              aria-label={`${name}: ${months[i].count} ${months[i].count === 1 ? "birthday" : "birthdays"}`}
              aria-current={current ? "page" : undefined}
              className={cn("flex flex-col items-center gap-1 rounded-lg py-1.5 transition-colors", current ? "bg-orbit-soft" : hot ? "bg-muted" : "hover:bg-muted")}
            >
              <span className="flex h-8 w-2.5 items-end overflow-hidden rounded-full bg-muted">
                <span
                  className={cn("w-full rounded-full transition-[height,background-color] duration-200", current || hot ? "bg-sun" : "bg-primary/45")}
                  style={{ height: `${months[i].count === 0 ? 0 : Math.max(18, (months[i].count / busiest) * 100)}%` }}
                />
              </span>
              <span className={cn("text-[0.7rem] font-bold", current || hot ? "text-primary" : "text-muted-foreground")}>{name[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
