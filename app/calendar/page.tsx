import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MonthCalendar } from "@/components/month-calendar";
import { MonthStrip } from "@/components/month-strip";
import { Screen } from "@/components/screen";
import { requireAccess } from "@/lib/auth";
import { birthdayCalendar } from "@/lib/birthdays/calendar";
import { MONTHS } from "@/lib/birthdays/dates";
import { today } from "@/lib/day";

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

      <MonthStrip
        year={year}
        month={monthNumber}
        months={Array.from({ length: 12 }, (_, i) => {
          const these = all.filter((r) => r.birthMonth === i + 1).sort((a, b) => a.birthDay - b.birthDay);
          return { count: these.length, names: these.slice(0, 3).map((r) => r.nicknames[0] ?? r.name.split(" ")[0]) };
        })}
      />

      <MonthCalendar
        month={month}
        today={day}
        prevHref={`/calendar?m=${shiftMonth(year, monthNumber, -1)}`}
        nextHref={`/calendar?m=${shiftMonth(year, monthNumber, 1)}`}
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
