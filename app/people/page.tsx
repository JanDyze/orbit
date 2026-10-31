import type { Metadata } from "next";
import { PeopleFinder } from "@/components/people-finder";
import { Screen } from "@/components/screen";
import { requireAccess } from "@/lib/auth";
import { birthdayCalendar } from "@/lib/birthdays/calendar";
import { today } from "@/lib/day";

export const metadata: Metadata = { title: "Everyone" };

// Everyone in your orbit, to find someone without knowing their birthday: search by name or
// nickname, or browse A to Z. The search lives in ?q= so coming back to the list keeps it.
export default async function PeoplePage({ searchParams }: PageProps<"/people">) {
  await requireAccess();
  const { q } = await searchParams;
  const rows = await birthdayCalendar(await today());
  return (
    <Screen back="/" title="Everyone">
      <PeopleFinder rows={rows} initialQuery={typeof q === "string" ? q : ""} />
    </Screen>
  );
}
