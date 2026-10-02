import "server-only";
import { orbit } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type GiftIdea = Database["orbit"]["Tables"]["gift_ideas"]["Row"];

// Ideas still to give first, newest at the top; given ones after.
export async function giftIdeas(personId: string): Promise<GiftIdea[]> {
  const db = await orbit();
  const { data, error } = await db
    .from("gift_ideas")
    .select("*")
    .eq("person_id", personId)
    .order("given", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Couldn't load gift ideas: ${error.message}`);
  return data;
}

export async function addGiftIdea(userId: string, personId: string, idea: string): Promise<GiftIdea> {
  const db = await orbit();
  const { data, error } = await db.from("gift_ideas").insert({ user_id: userId, person_id: personId, idea }).select().single();
  if (error) throw new Error(`Couldn't add that idea: ${error.message}`);
  return data;
}

export async function setGiftGiven(id: string, given: boolean) {
  const db = await orbit();
  const { error } = await db.from("gift_ideas").update({ given }).eq("id", id);
  if (error) throw new Error(`Couldn't update that idea: ${error.message}`);
}

export async function deleteGiftIdea(id: string) {
  const db = await orbit();
  const { error } = await db.from("gift_ideas").delete().eq("id", id);
  if (error) throw new Error(`Couldn't delete that idea: ${error.message}`);
}
