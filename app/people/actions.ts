"use server";

import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { z } from "zod";
import { requireAccess } from "@/lib/auth";
import { addGiftIdea, deleteGiftIdea, setGiftGiven } from "@/lib/birthdays/gifts";
import { giftIdeaSchema, parsePerson, type PersonField } from "@/lib/birthdays/input";
import { createPerson, deletePerson, updatePerson } from "@/lib/birthdays/people";
import { yearOf } from "@/lib/birthdays/dates";
import { today } from "@/lib/day";

// `saved` (an edit went through): the form goes back to where it came from (components/person-form.tsx).
export type PersonFormState = { errors?: Partial<Record<PersonField | "form", string>>; saved?: string };

const idSchema = z.uuid();

// Add someone (no `id`) or save changes to them. Name, month and day are enough.
export async function savePerson(_prev: PersonFormState, formData: FormData): Promise<PersonFormState> {
  const user = await requireAccess();
  const raw = {
    name: formData.get("name"),
    birthMonth: formData.get("birthMonth"),
    birthDay: formData.get("birthDay"),
    birthYear: formData.get("birthYear"),
    nicknames: formData.get("nicknames"),
    notes: formData.get("notes"),
  };
  const parsed = parsePerson(raw, yearOf(await today()));
  if (!parsed.ok) return { errors: parsed.errors };

  const id = formData.get("id");
  let personId: string;
  try {
    if (typeof id === "string" && id) {
      if (!idSchema.safeParse(id).success) return { errors: { form: "That person wasn't found." } };
      const saved = await updatePerson(id, parsed.person);
      if (!saved) return { errors: { form: "That person wasn't found." } };
      personId = saved.id;
    } else {
      personId = (await createPerson(user.id, parsed.person)).id;
    }
  } catch (e) {
    console.error(e);
    return { errors: { form: "Couldn't save. Check your connection and try again." } };
  }

  revalidatePath("/", "layout");
  // An edit goes back to the person's page rather than on to a new copy of it, so the edit page
  // doesn't linger behind it in history.
  if (typeof id === "string" && id) return { saved: personId };
  // "Save & add another" (the add flow, for entering many in a row) comes back to an empty form.
  redirect(formData.get("then") === "another" ? `/people/new?added=${personId}` : `/people/${personId}`, RedirectType.replace);
}

export async function removePerson(formData: FormData) {
  await requireAccess();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) redirect("/");
  await deletePerson(id.data);
  revalidatePath("/", "layout");
  redirect("/", RedirectType.replace);
}

export type GiftFormState = { error?: string; ok?: number };

export async function addGift(_prev: GiftFormState, formData: FormData): Promise<GiftFormState> {
  const user = await requireAccess();
  const personId = idSchema.safeParse(formData.get("personId"));
  const idea = giftIdeaSchema.safeParse(formData.get("idea"));
  if (!personId.success) return { error: "That person wasn't found." };
  if (!idea.success) return { error: idea.error.issues[0].message };
  try {
    await addGiftIdea(user.id, personId.data, idea.data);
  } catch (e) {
    console.error(e);
    return { error: "Couldn't add that idea. Try again." };
  }
  revalidatePath(`/people/${personId.data}`);
  // A fresh number each time, so the form knows to clear itself.
  return { ok: Date.now() };
}

export async function toggleGift(id: string, personId: string, given: boolean) {
  await requireAccess();
  if (!idSchema.safeParse(id).success || !idSchema.safeParse(personId).success) return;
  await setGiftGiven(id, given);
  revalidatePath(`/people/${personId}`);
}

export async function removeGift(id: string, personId: string) {
  await requireAccess();
  if (!idSchema.safeParse(id).success || !idSchema.safeParse(personId).success) return;
  await deleteGiftIdea(id);
  revalidatePath(`/people/${personId}`);
}
