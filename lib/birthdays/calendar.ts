import "server-only";
import { orbit } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

// Birthdays as of a given day, straight from orbit.birthday_calendar() / pending_birthdays(): the
// one shared calculation (days until, Feb 29 in other years, age turning, which year a greeting
// counts for). Nothing here works dates out itself.

type CompositeRow = Database["orbit"]["CompositeTypes"]["birthday_row"];

export type BirthdayRow = {
  personId: string;
  name: string;
  nicknames: string[];
  birthMonth: number;
  birthDay: number;
  birthYear: number | null;
  nextBirthday: string; // YYYY-MM-DD
  daysUntil: number;
  turning: number | null;
  lastBirthday: string;
  daysSince: number;
  occasionDate: string; // the nearer of next and last: the birthday the checklist logs against
  occasionYear: number;
  occasionAge: number | null;
};

// Composite types come back with every field nullable; these never are for a real person.
function toRow(r: CompositeRow): BirthdayRow {
  return {
    personId: r.person_id!,
    name: r.name!,
    nicknames: r.nicknames ?? [],
    birthMonth: r.birth_month!,
    birthDay: r.birth_day!,
    birthYear: r.birth_year,
    nextBirthday: r.next_birthday!,
    daysUntil: r.days_until!,
    turning: r.turning,
    lastBirthday: r.last_birthday!,
    daysSince: r.days_since!,
    occasionDate: r.occasion_date!,
    occasionYear: r.occasion_year!,
    occasionAge: r.occasion_age,
  };
}

// Everyone, soonest birthday first (today's first of all).
export async function birthdayCalendar(today: string): Promise<BirthdayRow[]> {
  const db = await orbit();
  const { data, error } = await db.rpc("birthday_calendar", { p_today: today });
  if (error) throw new Error(`Couldn't load birthdays: ${error.message}`);
  return data.map(toRow);
}

// Birthdays in the last `daysBack` days (today included) with nothing marked for them yet.
export async function pendingBirthdays(today: string, daysBack = 7): Promise<BirthdayRow[]> {
  const db = await orbit();
  const { data, error } = await db.rpc("pending_birthdays", { p_today: today, p_days_back: daysBack });
  if (error) throw new Error(`Couldn't load pending birthdays: ${error.message}`);
  return data.map(toRow);
}

export async function personBirthday(today: string, personId: string): Promise<BirthdayRow | null> {
  const db = await orbit();
  const { data, error } = await db.rpc("birthday_calendar", { p_today: today }).eq("person_id", personId).maybeSingle();
  if (error) throw new Error(`Couldn't load their birthday: ${error.message}`);
  return data ? toRow(data) : null;
}
