"use client";

import { useState } from "react";
import Link from "next/link";
import { BirthdayChecklist, EMPTY_CHECKLIST } from "@/components/birthday-checklist";
import { pastDetails } from "@/components/birthday-row";
import type { BirthdayRow } from "@/lib/birthdays/calendar";

const SHOWN = 2;

// Birthdays from the last week with nothing marked yet: one line each with the checklist as icons,
// and past two the rest wait behind "Show N more", so a busy week never pushes the year off the
// first screen.
export function PendingList({ rows }: { rows: BirthdayRow[] }) {
  const [open, setOpen] = useState(false);
  const shown = open ? rows : rows.slice(0, SHOWN);
  const hidden = rows.length - shown.length;
  return (
    <section aria-labelledby="pending" className="rounded-3xl border border-border bg-card px-3 pt-3 pb-1">
      <h2 id="pending" className="px-1 font-brand text-base font-extrabold tracking-tight">
        Not greeted yet
      </h2>
      <ul className="divide-y divide-border">
        {shown.map((row) => (
          <li key={row.personId} className="flex items-center gap-2 py-2.5">
            <Link href={`/people/${row.personId}`} className="min-w-0 flex-1 rounded-lg px-1">
              <p className="truncate font-medium">{row.nicknames[0] ?? row.name}</p>
              <p className="truncate text-xs text-muted-foreground">{pastDetails(row)}</p>
            </Link>
            <BirthdayChecklist personId={row.personId} year={row.occasionYear} done={EMPTY_CHECKLIST} compact />
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <button type="button" onClick={() => setOpen(true)} className="mb-2 w-full rounded-xl py-2 text-sm font-semibold text-primary hover:bg-orbit-soft">
          Show {hidden} more
        </button>
      )}
    </section>
  );
}
