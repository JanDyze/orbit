import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { DeletePersonButton } from "@/components/delete-person-button";
import { PersonForm } from "@/components/person-form";
import { Screen } from "@/components/screen";
import { requireAccess } from "@/lib/auth";
import { getPerson } from "@/lib/birthdays/people";

export const metadata: Metadata = { title: "Edit" };

export default async function EditPersonPage({ params }: PageProps<"/people/[id]/edit">) {
  await requireAccess();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const person = await getPerson(id);
  if (!person) notFound();

  return (
    <Screen back={`/people/${id}`} title={`Edit ${person.name}`}>
      <PersonForm
        submitLabel="Save"
        person={{
          id: person.id,
          name: person.name,
          birthMonth: person.birth_month,
          birthDay: person.birth_day,
          birthYear: person.birth_year,
          nicknames: person.nicknames,
          notes: person.notes,
        }}
      />
      <div className="mt-10 border-t border-border pt-6">
        <DeletePersonButton id={person.id} name={person.name} />
      </div>
    </Screen>
  );
}
