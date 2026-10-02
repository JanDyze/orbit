"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Check, ChevronDown, Loader2, RotateCcw } from "lucide-react";
import { savePerson, type PersonFormState } from "@/app/people/actions";
import { maxDayOfMonth, MONTHS } from "@/lib/birthdays/dates";
import { OrbitRing, RING_C as C, RING_R as R, RING_WIDTH, RingBeads } from "@/components/orbit-ring";
import { arcPath, dayAngle, daysUntilDate, polar } from "@/lib/birthdays/orbit-geometry";
import { cn } from "@/lib/utils";

// Adding someone is placing them in your orbit, on the same ring as home: today at the top in the
// gap with the flame, the year clockwise, everyone already in Orbit as beads (so the busy stretches
// show). Type the name; tap the month where it sits on the ring; the ring offers that month's days
// and the month's own stretch lights up; tap the day and their bead lands where it will sit on the
// home dial. Year, nicknames and notes wait behind "optional", since name and date are enough.
// "Save & add another" keeps you here for entering a batch.

// Places a button on the ring, as a share of the square it sits in.
function ringStyle(deg: number, radiusShare: number): React.CSSProperties {
  const a = ((deg - 90) * Math.PI) / 180;
  return { left: `${50 + radiusShare * 50 * Math.cos(a)}%`, top: `${50 + radiusShare * 50 * Math.sin(a)}%` };
}

export function OrbitAdd({
  today,
  beads,
  added,
}: {
  today: string;
  beads: number[]; // everyone's days until their birthday
  added: { id: string; name: string; month: number; day: number } | null;
}) {
  const [state, formAction, pending] = useActionState<PersonFormState, FormData>(savePerson, {});
  const [, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [month, setMonth] = useState<number | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [then, setThen] = useState<"open" | "another">("open");
  const nameRef = useRef<HTMLInputElement>(null);
  const errors = state.errors ?? {};

  const stage = month == null ? "month" : day == null ? "day" : "placed";
  const ready = name.trim() !== "" && month != null && day != null;
  const monthDays = month ? maxDayOfMonth(month) : 0;

  function pickMonth(m: number) {
    setMonth(m);
    setDay(null);
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!ready) return;
        const data = new FormData(e.currentTarget);
        data.set("then", then);
        startTransition(() => formAction(data));
      }}
      className="flex flex-col gap-6"
    >
      {added && (
        <p role="status" className="add-landed flex items-center gap-3 rounded-2xl bg-orbit-soft px-4 py-3 text-sm">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sun text-sun-foreground">
            <Check className="size-4" strokeWidth={3} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-semibold">{added.name}</span> is in your orbit, on {MONTHS[added.month - 1]} {added.day}.
          </span>
          <Link href={`/people/${added.id}`} className="shrink-0 font-semibold text-primary">
            Open
          </Link>
        </p>
      )}

      <div>
        <label htmlFor="name" className="sr-only">
          Name
        </label>
        <input
          ref={nameRef}
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Their name"
          autoComplete="off"
          autoCapitalize="words"
          autoFocus
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
          className="w-full border-b-2 border-input bg-transparent pb-2 font-brand text-3xl font-extrabold tracking-tight outline-none placeholder:text-muted-foreground/75 focus:border-primary aria-invalid:border-destructive"
        />
        {errors.name && (
          <p id="name-error" className="mt-1.5 text-sm text-destructive">
            {errors.name}
          </p>
        )}
      </div>

      <input type="hidden" name="birthMonth" value={month ?? ""} />
      <input type="hidden" name="birthDay" value={day ?? ""} />

      {/* The ring. */}
      <div className="relative mx-auto aspect-square w-full max-w-[22.5rem]">
        <svg viewBox="0 0 360 360" className="absolute inset-0 size-full overflow-visible" aria-hidden>
          <g opacity={stage === "month" ? 1 : 0.22} className="transition-opacity duration-500">
            <OrbitRing />
          </g>
          {/* The chosen month's own stretch of the year, while you pick the day. */}
          {month != null && (
            <path
              key={month}
              className="add-arc"
              pathLength={100}
              d={arcPath(C, C, R, dayAngle(daysUntilDate(today, month, 1)), dayAngle(daysUntilDate(today, month, maxDayOfMonth(month))))}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={RING_WIDTH}
              strokeLinecap="round"
            />
          )}
          <RingBeads days={beads} dim={stage !== "month"} />
          {/* Them, landing where they'll sit on the home dial. */}
          {month != null && day != null && (
            <g key={`${month}-${day}`} transform={`translate(${polar(C, C, R, dayAngle(daysUntilDate(today, month, day))).x} ${polar(C, C, R, dayAngle(daysUntilDate(today, month, day))).y})`}>
              <circle className="add-bead" r={9} fill="var(--sun)" stroke="var(--primary)" strokeWidth={3} />
            </g>
          )}
          <circle cx={C} cy={C} r={62} fill="var(--sun)" className="add-sun" />
        </svg>

        {/* The sun says what's chosen so far. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-sun-foreground">
          {stage === "month" ? (
            <>
              <span className="font-brand text-xl font-extrabold">Birthday</span>
              <span className="text-xs font-medium opacity-80">pick the month</span>
            </>
          ) : (
            <>
              <span className="font-brand text-2xl font-extrabold leading-tight">
                {MONTHS[month! - 1].slice(0, 3)}
                {day != null && ` ${day}`}
              </span>
              {stage === "day" ? (
                <span className="text-xs font-medium opacity-80">now the day</span>
              ) : (
                <span className="text-xs font-medium opacity-80">{name.trim() ? name.trim().split(" ")[0] : "their day"}</span>
              )}
              <button
                type="button"
                onClick={() => {
                  setMonth(null);
                  setDay(null);
                }}
                className="pointer-events-auto mt-1 flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold hover:bg-white/40"
              >
                <RotateCcw className="size-3" aria-hidden />
                Month
              </button>
            </>
          )}
        </div>

        {/* Months around the ring, or the chosen month's days. */}
        <div role="group" aria-label={stage === "month" ? "Birthday month" : `Day in ${MONTHS[month! - 1]}`} className="pointer-events-none absolute inset-0">
          {stage === "month"
            ? MONTHS.map((m, i) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => pickMonth(i + 1)}
                  style={{ ...ringStyle(dayAngle(daysUntilDate(today, i + 1, 15)), 0.86), animationDelay: `${i * 25}ms` }}
                  aria-label={m}
                  className="add-choice pointer-events-auto absolute flex h-10 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card font-brand text-sm font-extrabold text-primary shadow-[0_2px_6px_-2px_oklch(0.3_0.05_262/0.35)] ring-1 ring-border hover:bg-orbit-soft"
                >
                  {m.slice(0, 3)}
                </button>
              ))
            : Array.from({ length: monthDays }, (_, i) => {
                const d = i + 1;
                const on = d === day;
                return (
                  <button
                    key={`${month}-${d}`}
                    type="button"
                    onClick={() => setDay(d)}
                    aria-pressed={on}
                    aria-label={`${MONTHS[month! - 1]} ${d}`}
                    style={{ ...ringStyle(((d - 1) / monthDays) * 360, 0.86), animationDelay: `${i * 12}ms` }}
                    className={cn(
                      "add-choice pointer-events-auto absolute flex size-[1.9rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold tabular-nums transition-colors",
                      on ? "bg-sun text-sun-foreground ring-2 ring-primary" : "bg-card text-foreground ring-1 ring-border hover:bg-orbit-soft",
                    )}
                  >
                    {d}
                  </button>
                );
              })}
        </div>
      </div>
      {(errors.birthMonth || errors.birthDay || errors.birthYear) && (
        <p className="-mt-3 text-center text-sm text-destructive">{errors.birthMonth ?? errors.birthDay ?? errors.birthYear}</p>
      )}

      <details className="group rounded-2xl border border-border bg-card" open={Boolean(errors.birthYear || errors.nicknames || errors.notes)}>
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold">
          Year, nicknames, notes
          <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
            optional
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
          </span>
        </summary>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Birth year
            <input
              name="birthYear"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              placeholder="Leave empty if you don't know"
              aria-invalid={Boolean(errors.birthYear)}
              className="h-11 rounded-xl border border-input bg-background px-3 text-base font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Nicknames
            <input
              name="nicknames"
              placeholder="What you call them, e.g. Mai, Ria"
              autoComplete="off"
              aria-invalid={Boolean(errors.nicknames)}
              className="h-11 rounded-xl border border-input bg-background px-3 text-base font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            />
            {errors.nicknames && <span className="text-sm font-normal text-destructive">{errors.nicknames}</span>}
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Notes
            <textarea
              name="notes"
              rows={2}
              placeholder="Likes, sizes, kids' names…"
              className="rounded-xl border border-input bg-background px-3 py-2 text-base font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            />
          </label>
        </div>
      </details>

      {errors.form && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errors.form}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={!ready || pending}
          onClick={() => setThen("open")}
          className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
        >
          {pending && then === "open" && <Loader2 className="size-5 animate-spin" aria-hidden />}
          Place in your orbit
        </button>
        <button
          type="submit"
          disabled={!ready || pending}
          onClick={() => setThen("another")}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-primary hover:bg-orbit-soft disabled:opacity-40"
        >
          {pending && then === "another" && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Save &amp; add another
        </button>
        {!ready && (
          <p className="text-center text-xs text-muted-foreground">
            {name.trim() === "" ? "Start with their name." : month == null ? "Then tap their birthday month on the ring." : "Now tap the day."}
          </p>
        )}
      </div>
    </form>
  );
}
