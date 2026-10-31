import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { BirthdayRow } from "@/lib/birthdays/calendar";
import { daysSinceLabel, shortDay, weekday } from "@/lib/birthdays/dates";
import { cn } from "@/lib/utils";

type Tone = "today" | "week" | "plain";

export function toneFor(daysUntil: number): Tone {
  if (daysUntil === 0) return "today";
  if (daysUntil <= 7) return "week";
  return "plain";
}

// The row's lead, in the dial's language: how far round the year they are from now. Today is the
// sun; this week is the ring's blue.
function Countdown({ days }: { days: number }) {
  const tone = toneFor(days);
  if (tone === "today") {
    return (
      <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded-full bg-sun font-brand text-sm font-extrabold text-sun-foreground">
        Today
      </span>
    );
  }
  return (
    <span className="flex w-14 shrink-0 flex-col items-center leading-none">
      <span className={cn("font-brand text-2xl font-extrabold tabular-nums", tone === "week" ? "text-primary" : "text-foreground")}>{days}</span>
      <span className="mt-0.5 text-[0.65rem] font-semibold text-muted-foreground">{days === 1 ? "day" : "days"}</span>
    </span>
  );
}

function leapNote(row: BirthdayRow, day: string) {
  return row.birthMonth === 2 && row.birthDay === 29 && day.endsWith("-02-28") ? "Feb 29 birthday" : null;
}

// One person in the upcoming list: how many days away, when, and the age they're turning.
export function BirthdayRowLink({ row }: { row: BirthdayRow }) {
  const details = [
    `${weekday(row.nextBirthday).slice(0, 3)}, ${shortDay(row.nextBirthday)}`,
    row.turning != null ? `turns ${row.turning}` : null,
    leapNote(row, row.nextBirthday),
  ].filter(Boolean);
  return (
    <Link href={`/people/${row.personId}`} transitionTypes={["nav-forward"]} className="flex items-center gap-3 rounded-2xl py-2.5 pr-2 transition-colors hover:bg-muted active:bg-muted">
      <Countdown days={row.daysUntil} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {row.name}
          {row.nicknames[0] && <span className="font-normal text-muted-foreground"> · {row.nicknames[0]}</span>}
        </p>
        <p className="truncate text-sm text-muted-foreground">{details.join(" · ")}</p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" aria-hidden />
    </Link>
  );
}

// "3 days ago · turned 31" for a birthday just gone (short: it shares a line with the checklist).
export function pastDetails(row: BirthdayRow) {
  return [daysSinceLabel(row.daysSince), row.occasionAge != null ? `turned ${row.occasionAge}` : null]
    .filter(Boolean)
    .join(" · ");
}
