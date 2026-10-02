import Link from "next/link";
import { BirthdayChecklist, EMPTY_CHECKLIST } from "@/components/birthday-checklist";
import { PendingList } from "@/components/pending-list";
import { Screen } from "@/components/screen";
import { YearDial } from "@/components/year-dial";
import { requireAccess } from "@/lib/auth";
import { birthdayCalendar, pendingBirthdays } from "@/lib/birthdays/calendar";
import { logsFor } from "@/lib/birthdays/log";
import { today } from "@/lib/day";

// Home: today first, then the year. On a day with birthdays (or ones just gone with nothing marked),
// their one-tap checklists come first; the year dial is always there, showing who's next.
export default async function Home() {
  await requireAccess();
  const day = await today();
  const [rows, pending] = await Promise.all([birthdayCalendar(day), pendingBirthdays(day)]);

  const todays = rows.filter((r) => r.daysUntil === 0);
  // Today's birthdays have their own cards; pending is for the ones just gone.
  const missed = pending.filter((r) => r.daysSince > 0);
  const logs = await logsFor(todays.map((r) => ({ personId: r.personId, year: r.occasionYear })));

  return (
    <Screen tab="home">
      {(todays.length > 0 || missed.length > 0) && (
        <div className="mb-6 flex flex-col gap-3">
          {todays.map((row) => (
            <section key={row.personId} aria-label={`${row.name}'s birthday is today`} className="rounded-3xl bg-sun px-4 pt-3.5 pb-4 text-sun-foreground">
              <Link href={`/people/${row.personId}`} className="mb-3 block">
                <h2 className="font-brand text-[1.6rem] leading-tight font-extrabold tracking-tight">
                  {row.nicknames[0] ?? row.name}
                </h2>
                <p className="text-sm font-medium opacity-80">
                  {row.nicknames[0] ? `${row.name} · ` : ""}
                  {row.turning != null ? `turns ${row.turning} today` : "birthday today"}
                </p>
              </Link>
              <BirthdayChecklist personId={row.personId} year={row.occasionYear} done={logs.get(row.personId) ?? EMPTY_CHECKLIST} tone="sun" />
            </section>
          ))}

          {missed.length > 0 && <PendingList rows={missed} />}
        </div>
      )}

      <YearDial rows={rows} today={day} compact={todays.length > 0 || missed.length > 0} />
    </Screen>
  );
}
