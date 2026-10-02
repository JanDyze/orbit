import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MonthCalendar } from "@/components/month-calendar";
import { Screen } from "@/components/screen";
import { requireAccess } from "@/lib/auth";
import { birthdayCalendar } from "@/lib/birthdays/calendar";
import { MONTHS } from "@/lib/birthdays/dates";
import { today } from "@/lib/day";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Calendar" };

const MONTH_PARAM = /^(\d{4})-(0[1-9]|1[0-2])$/;

function shiftMonth(year: number, month: number, by: number) {
  const index = year * 12 + (month - 1) + by;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
}

// One month at a time. The dates come from the same birthday_calendar() as everything else, asked
// as of the month's first day, so Feb 29 and ages work out exactly as on the home dial.
export default async function CalendarPage({ searchParams }: PageProps<"/calendar">) {
  await requireAccess();
  const day = await today();
  const { m } = await searchParams;
  const month = typeof m === "string" && MONTH_PARAM.test(m) ? m : day.slice(0, 7);
  const year = Number(month.slice(0, 4));
  const monthNumber = Number(month.slice(5, 7));

  const all = await birthdayCalendar(`${month}-01`);
  const inMonth = all.filter((r) => r.nextBirthday.startsWith(month));
  const perMonth = Array.from({ length: 12 }, (_, i) => all.filter((r) => r.birthMonth === i + 1).length);
  const busiest = Math.max(1, ...perMonth);

  return (
    <Screen tab="calendar">
      <div className="mb-4 flex items-center gap-1">
        <Link
          href={`/calendar?m=${shiftMonth(year, monthNumber, -1)}`}
          aria-label="Previous month"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
        <h1 className="min-w-0 flex-1 text-center font-brand text-2xl font-extrabold tracking-tight">
          {MONTHS[monthNumber - 1]} <span className="text-muted-foreground">{year}</span>
        </h1>
        <Link
          href={`/calendar?m=${shiftMonth(year, monthNumber, 1)}`}
          aria-label="Next month"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronRight className="size-5" aria-hidden />
        </Link>
      </div>

      {/* The year at a glance: each month's initial over a bar as tall as its share of birthdays. */}
      <nav aria-label="Months" className="mb-5 grid grid-cols-12 gap-1">
        {MONTHS.map((name, i) => {
          const value = `${year}-${String(i + 1).padStart(2, "0")}`;
          const current = i + 1 === monthNumber;
          return (
            <Link
              key={name}
              href={`/calendar?m=${value}`}
              aria-label={`${name}: ${perMonth[i]} ${perMonth[i] === 1 ? "birthday" : "birthdays"}`}
              aria-current={current ? "page" : undefined}
              className={cn("flex flex-col items-center gap-1 rounded-lg py-1.5", current ? "bg-orbit-soft" : "hover:bg-muted")}
            >
              <span className="flex h-7 w-2 items-end overflow-hidden rounded-full bg-muted">
                <span
                  className={cn("w-full rounded-full", current ? "bg-sun" : "bg-primary/45")}
                  style={{ height: `${perMonth[i] === 0 ? 0 : Math.max(18, (perMonth[i] / busiest) * 100)}%` }}
                />
              </span>
              <span className={cn("text-[0.7rem] font-bold", current ? "text-primary" : "text-muted-foreground")}>{name[0]}</span>
            </Link>
          );
        })}
      </nav>

      <MonthCalendar
        month={month}
        today={day}
        people={inMonth.map((r) => ({
          personId: r.personId,
          name: r.name,
          nickname: r.nicknames[0] ?? null,
          date: r.nextBirthday,
          turning: r.turning,
          leap: r.birthMonth === 2 && r.birthDay === 29 && !r.nextBirthday.endsWith("-29"),
        }))}
      />

      {month !== day.slice(0, 7) && (
        <Link href="/calendar" className="mx-auto mt-6 rounded-full px-4 py-2 text-sm font-medium text-primary hover:bg-orbit-soft">
          Back to this month
        </Link>
      )}
    </Screen>
  );
}
