"use client";

import { useOffline } from "next/offline";
import { cn } from "@/lib/utils";

// What a page shows the instant it's tapped, while its birthdays load: its own shape in quiet
// tints, so nothing jumps when the real page lands. The one moving part is the loader, the year
// ring with a spark making its trip around the sun (globals.css, "Loading"). With no connection,
// it says so instead of spinning on.

const C = 180;
const R = 124;
const GAP = 10; // half the gap at today, in degrees

function point(deg: number, r = R) {
  const a = ((deg - 90) * Math.PI) / 180;
  return `${(C + r * Math.cos(a)).toFixed(2)} ${(C + r * Math.sin(a)).toFixed(2)}`;
}

export function OrbitLoader({ className, sun = true }: { className?: string; sun?: boolean }) {
  const offline = useOffline();
  return (
    <div className={cn("relative mx-auto aspect-square w-full", className)}>
      <svg viewBox="0 0 360 360" className="orbit-loader block size-full overflow-visible" data-offline={offline || undefined} aria-hidden>
        <path d={`M ${point(GAP)} A ${R} ${R} 0 1 1 ${point(-GAP)}`} fill="none" stroke="var(--primary)" strokeOpacity={0.12} strokeWidth={20} strokeLinecap="round" />
        {sun && <circle className="loader-sun" cx={C} cy={C} r={54} fill="var(--sun)" opacity={0.28} />}
        <g className="loader-spark">
          <circle cx={C} cy={C - R} r={8} fill="var(--sun)" />
        </g>
      </svg>
      <p role="status" className={cn("absolute inset-x-0 top-1/2 -translate-y-1/2 px-[17%] text-center text-sm font-medium", sun ? "text-sun-foreground/80" : "text-muted-foreground")}>
        {offline ? "Waiting for a connection…" : <span className="sr-only">Loading</span>}
      </p>
    </div>
  );
}

// A soft block standing in for text or a control.
export function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <span aria-hidden style={style} className={cn("skeleton-bone block rounded-full bg-muted", className)} />;
}

// One upcoming-birthday row: the countdown, then a name and a detail line.
export function RowBones({ count = 3 }: { count?: number }) {
  return (
    <div aria-hidden className="flex flex-col">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5 pr-2">
          <span className="flex w-14 shrink-0 flex-col items-center gap-1.5">
            <Bone className="h-5 w-7 rounded-lg" />
            <Bone className="h-2 w-6" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            <Bone className={cn("h-3.5", ["w-36", "w-28", "w-44"][i % 3])} />
            <Bone className={cn("h-3", ["w-24", "w-32", "w-20"][i % 3])} />
          </span>
        </div>
      ))}
    </div>
  );
}
