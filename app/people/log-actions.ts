"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAccess } from "@/lib/auth";
import { ACTIONS, noteSchema, type BirthdayAction } from "@/lib/birthdays/input";
import { setAction, setGiftNote } from "@/lib/birthdays/log";

// The birthday checklist. `year` is the birthday's own year (the calendar's occasion_year), so the
// tap lands on the right row even across New Year.

const occasionSchema = z.object({
  personId: z.uuid(),
  year: z.number().int().min(1900).max(2100),
});

export async function markAction(personId: string, year: number, action: BirthdayAction, done: boolean): Promise<{ error?: string }> {
  const user = await requireAccess();
  const occasion = occasionSchema.safeParse({ personId, year });
  if (!occasion.success || !ACTIONS.includes(action)) return { error: "Couldn't save that." };
  try {
    await setAction(user.id, personId, year, action, done === true);
  } catch (e) {
    console.error(e);
    return { error: "Couldn't save that. Try again." };
  }
  revalidatePath("/");
  revalidatePath(`/people/${personId}`);
  return {};
}

export type GiftNoteState = { error?: string; saved?: number };

export async function saveGiftNote(_prev: GiftNoteState, formData: FormData): Promise<GiftNoteState> {
  const user = await requireAccess();
  const occasion = occasionSchema.safeParse({ personId: formData.get("personId"), year: Number(formData.get("year")) });
  const note = noteSchema.safeParse(formData.get("giftNote"));
  if (!occasion.success) return { error: "Couldn't save the note." };
  if (!note.success) return { error: note.error.issues[0].message };
  try {
    await setGiftNote(user.id, occasion.data.personId, occasion.data.year, note.data);
  } catch (e) {
    console.error(e);
    return { error: "Couldn't save the note. Try again." };
  }
  revalidatePath(`/people/${occasion.data.personId}`);
  return { saved: Date.now() };
}
