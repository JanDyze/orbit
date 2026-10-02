import "server-only";
import { orbit } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { PersonInput } from "./input";

// People queries. RLS already limits every query to the signed-in user's own rows; the explicit
// user_id on inserts is what the policies' WITH CHECK compares against.

export type Person = Database["orbit"]["Tables"]["people"]["Row"];

function toColumns(input: PersonInput) {
  return {
    name: input.name,
    birth_month: input.birthMonth,
    birth_day: input.birthDay,
    birth_year: input.birthYear,
    nicknames: input.nicknames,
    notes: input.notes,
  };
}

export async function getPerson(id: string): Promise<Person | null> {
  const db = await orbit();
  const { data, error } = await db.from("people").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Couldn't load that person: ${error.message}`);
  return data;
}

export async function createPerson(userId: string, input: PersonInput): Promise<Person> {
  const db = await orbit();
  const { data, error } = await db.from("people").insert({ user_id: userId, ...toColumns(input) }).select().single();
  if (error) throw new Error(`Couldn't add them: ${error.message}`);
  return data;
}

export async function updatePerson(id: string, input: PersonInput): Promise<Person | null> {
  const db = await orbit();
  const { data, error } = await db.from("people").update(toColumns(input)).eq("id", id).select().maybeSingle();
  if (error) throw new Error(`Couldn't save them: ${error.message}`);
  return data;
}

// Their log and gift ideas go with them (on delete cascade).
export async function deletePerson(id: string) {
  const db = await orbit();
  const { error } = await db.from("people").delete().eq("id", id);
  if (error) throw new Error(`Couldn't delete them: ${error.message}`);
}
