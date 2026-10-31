import type { Metadata } from "next";
import { z } from "zod";
import { OrbitAdd } from "@/components/orbit-add";
import { Screen } from "@/components/screen";
import { requireAccess } from "@/lib/auth";
import { birthdayCalendar } from "@/lib/birthdays/calendar";
import { getPerson } from "@/lib/birthdays/people";
import { today } from "@/lib/day";

export const metadata: Metadata = { title: "Add someone" };

export default async function NewPersonPage({ searchParams }: PageProps<"/people/new">) {
  await requireAccess();
  const { added, name } = await searchParams;
  const addedId = typeof added === "string" && z.uuid().safeParse(added).success ? added : null;
  const day = await today();
  const [rows, person] = await Promise.all([birthdayCalendar(day), addedId ? getPerson(addedId) : null]);

  return (
    <Screen back="/" title="Add someone">
      <OrbitAdd
        // A fresh form after each "Save & add another".
        key={addedId ?? "new"}
        today={day}
        beads={rows.map((r) => r.daysUntil)}
        initialName={typeof name === "string" ? name.slice(0, 120) : ""}
        added={person ? { id: person.id, name: person.name, month: person.birth_month, day: person.birth_day } : null}
      />
    </Screen>
  );
}
