import "server-only";
import { orbit } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { BirthdayAction } from "./input";

export type LogEntry = Database["orbit"]["Tables"]["birthday_log"]["Row"];

export function didSomething(entry: Pick<LogEntry, BirthdayAction>) {
  return entry.greeted || entry.prayed || entry.gifted || entry.celebrated;
}

// Every year's entry for someone, newest first.
export async function logHistory(personId: string): Promise<LogEntry[]> {
  const db = await orbit();
  const { data, error } = await db.from("birthday_log").select("*").eq("person_id", personId).order("year", { ascending: false });
  if (error) throw new Error(`Couldn't load their history: ${error.message}`);
  return data;
}

// Entries for several people's birthdays at once, keyed by person id (the home list's checklists).
export async function logsFor(occasions: { personId: string; year: number }[]): Promise<Map<string, LogEntry>> {
  const found = new Map<string, LogEntry>();
  if (occasions.length === 0) return found;
  const db = await orbit();
  const { data, error } = await db
    .from("birthday_log")
    .select("*")
    .in("person_id", [...new Set(occasions.map((o) => o.personId))])
    .in("year", [...new Set(occasions.map((o) => o.year))]);
  if (error) throw new Error(`Couldn't load checklists: ${error.message}`);
  for (const o of occasions) {
    const entry = data.find((e) => e.person_id === o.personId && e.year === o.year);
    if (entry) found.set(o.personId, entry);
  }
  return found;
}

// Marks (or unmarks) one action for a birthday year, making that year's row if it's the first.
// The upsert only writes the columns it's given, so the other actions and notes stay as they were.
export async function setAction(userId: string, personId: string, year: number, action: BirthdayAction, done: boolean) {
  const db = await orbit();
  const row: Database["orbit"]["Tables"]["birthday_log"]["Insert"] = { user_id: userId, person_id: personId, year };
  row[action] = done;
  const { data, error } = await db
    .from("birthday_log")
    .upsert(row, { onConflict: "person_id,year" })
    .select()
    .single();
  if (error) throw new Error(`Couldn't save that: ${error.message}`);
  return data;
}

export async function setGiftNote(userId: string, personId: string, year: number, giftNote: string | null) {
  const db = await orbit();
  const { data, error } = await db
    .from("birthday_log")
    .upsert({ user_id: userId, person_id: personId, year, gift_note: giftNote }, { onConflict: "person_id,year" })
    .select()
    .single();
  if (error) throw new Error(`Couldn't save the gift note: ${error.message}`);
  return data;
}
