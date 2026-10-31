import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cake, Pencil } from "lucide-react";
import { z } from "zod";
import { BirthdayChecklist, EMPTY_CHECKLIST } from "@/components/birthday-checklist";
import { GiftIdeas } from "@/components/gift-ideas";
import { GiftNoteForm } from "@/components/gift-note-form";
import { Screen, SectionTitle } from "@/components/screen";
import { requireAccess } from "@/lib/auth";
import { personBirthday, type BirthdayRow } from "@/lib/birthdays/calendar";
import { daysSinceLabel, longDate, shortDay, weekday, yearOf } from "@/lib/birthdays/dates";
import { giftIdeas } from "@/lib/birthdays/gifts";
import { ACTIONS } from "@/lib/birthdays/input";
import { didSomething, logHistory } from "@/lib/birthdays/log";
import { getPerson } from "@/lib/birthdays/people";
import { today } from "@/lib/day";
import { cn } from "@/lib/utils";

const ACTION_LABELS = { greeted: "Greeted", prayed: "Prayed", gifted: "Gifted", celebrated: "Celebrated" } as const;

export async function generateMetadata({ params }: PageProps<"/people/[id]">): Promise<Metadata> {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return {};
  const person = await getPerson(id).catch(() => null);
  return { title: person?.name ?? "Person" };
}

// The big line on top: today, just gone, or how long to go.
function Countdown({ b, thisYear }: { b: BirthdayRow; thisYear: number }) {
  const lastIsNearer = b.occasionDate === b.lastBirthday && b.daysSince > 0;
  const today = b.daysUntil === 0;
  return (
    <div className={cn("rounded-3xl p-5", today ? "bg-sun text-sun-foreground" : "bg-orbit-soft")}>
      {today ? (
        <>
          <p className="flex items-center gap-2 font-brand text-3xl font-extrabold">
            <Cake className="size-7" aria-hidden />
            {b.turning != null ? `Turns ${b.turning} today` : "Birthday today"}
          </p>
        </>
      ) : lastIsNearer ? (
        <>
          <p className="font-brand text-3xl font-extrabold text-primary">{daysSinceLabel(b.daysSince)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {weekday(b.lastBirthday)}, {shortDay(b.lastBirthday)}
            {b.occasionAge != null && ` · turned ${b.occasionAge}`}
          </p>
        </>
      ) : (
        <>
          <p className="font-brand text-3xl font-extrabold text-primary">
            {b.daysUntil === 1 ? "Tomorrow" : `${b.daysUntil} days to go`}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {weekday(b.nextBirthday)}, {shortDay(b.nextBirthday)}
            {yearOf(b.nextBirthday) !== thisYear && `, ${yearOf(b.nextBirthday)}`}
            {b.turning != null && ` · turns ${b.turning}`}
          </p>
        </>
      )}
    </div>
  );
}

export default async function PersonPage({ params }: PageProps<"/people/[id]">) {
  await requireAccess();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const day = await today();
  const [person, birthday, ideas, history] = await Promise.all([getPerson(id), personBirthday(day, id), giftIdeas(id), logHistory(id)]);
  if (!person || !birthday) notFound();

  const current = history.find((h) => h.year === birthday.occasionYear);
  const leap = person.birth_month === 2 && person.birth_day === 29;

  return (
    <Screen
      back="/"
      title={person.name}
      action={
        <Link
          href={`/people/${id}/edit`}
          transitionTypes={["nav-forward"]}
          aria-label={`Edit ${person.name}`}
          className="flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Pencil className="size-5" aria-hidden />
        </Link>
      }
    >
      <p className="mb-4 px-1 text-sm text-muted-foreground">
        {longDate(person.birth_month, person.birth_day, person.birth_year)}
        {person.nicknames.length > 0 && <span className="block">Also called {person.nicknames.join(", ")}</span>}
        {leap && <span className="block text-xs">Leap-day birthday: celebrated on Feb 28 in common years.</span>}
      </p>

      <Countdown b={birthday} thisYear={yearOf(day)} />

      <section aria-labelledby="checklist" className="mt-8">
        <SectionTitle>
          <span id="checklist">
            For {longDate(Number(birthday.occasionDate.slice(5, 7)), Number(birthday.occasionDate.slice(8, 10)), birthday.occasionYear)}
          </span>
        </SectionTitle>
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-3">
          <BirthdayChecklist personId={id} year={birthday.occasionYear} done={current ?? EMPTY_CHECKLIST} />
          <GiftNoteForm personId={id} year={birthday.occasionYear} giftNote={current?.gift_note ?? null} />
        </div>
      </section>

      <section aria-labelledby="gifts" className="mt-8">
        <SectionTitle>
          <span id="gifts">Gift ideas</span>
        </SectionTitle>
        <GiftIdeas personId={id} ideas={ideas.map(({ id, idea, given }) => ({ id, idea, given }))} />
      </section>

      {person.notes && (
        <section aria-labelledby="notes" className="mt-8">
          <SectionTitle>
            <span id="notes">Notes</span>
          </SectionTitle>
          <p className="rounded-2xl border border-border bg-card p-4 whitespace-pre-wrap select-text">{person.notes}</p>
        </section>
      )}

      <section aria-labelledby="history" className="mt-8">
        <SectionTitle>
          <span id="history">Past birthdays</span>
        </SectionTitle>
        {history.length === 0 ? (
          <p className="px-1 text-sm text-muted-foreground">Nothing logged yet. What you mark above shows up here, year by year.</p>
        ) : (
          <ol className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
            {history.map((entry) => (
              <li key={entry.id} className="flex gap-4 p-4">
                <span className="w-12 shrink-0 font-brand text-lg font-extrabold tabular-nums text-primary">{entry.year}</span>
                <div className="min-w-0 flex-1">
                  {didSomething(entry) ? (
                    <div className="flex flex-wrap gap-1.5">
                      {ACTIONS.filter((a) => entry[a]).map((a) => (
                        <span key={a} className="rounded-full bg-orbit-soft px-2.5 py-0.5 text-xs font-medium text-primary">
                          {ACTION_LABELS[a]}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nothing marked</p>
                  )}
                  {entry.gift_note && <p className="mt-1.5 text-sm">Gave: {entry.gift_note}</p>}
                  {entry.notes && <p className="mt-1 text-sm text-muted-foreground">{entry.notes}</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </Screen>
  );
}
