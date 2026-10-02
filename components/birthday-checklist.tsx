"use client";

import { useOptimistic, useState, useTransition } from "react";
import { CelebratedIcon, GiftedIcon, GreetedIcon, PrayedIcon } from "@/components/icons";
import { markAction } from "@/app/people/log-actions";
import type { BirthdayAction } from "@/lib/birthdays/input";
import { cn } from "@/lib/utils";

const ITEMS: { action: BirthdayAction; label: string; Icon: typeof GiftedIcon }[] = [
  { action: "greeted", label: "Greeted", Icon: GreetedIcon },
  { action: "prayed", label: "Prayed", Icon: PrayedIcon },
  { action: "gifted", label: "Gifted", Icon: GiftedIcon },
  { action: "celebrated", label: "Celebrated", Icon: CelebratedIcon },
];

export type Checklist = Record<BirthdayAction, boolean>;

export const EMPTY_CHECKLIST: Checklist = { greeted: false, prayed: false, gifted: false, celebrated: false };

// Four big tap targets for one birthday. A tap shows at once and saves in the background (it
// upserts that birthday year's log row); if saving fails, it flips back and says so.
// `compact` is the icon-only strip for a row (the pending list), the labels kept for screen readers.
export function BirthdayChecklist({
  personId,
  year,
  done,
  tone = "plain",
  compact = false,
}: {
  personId: string;
  year: number;
  done: Checklist;
  tone?: "plain" | "sun";
  compact?: boolean;
}) {
  const [checked, setChecked] = useOptimistic(done, (state, change: { action: BirthdayAction; value: boolean }) => ({
    ...state,
    [change.action]: change.value,
  }));
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function toggle(action: BirthdayAction) {
    const value = !checked[action];
    setError(null);
    startTransition(async () => {
      setChecked({ action, value });
      const result = await markAction(personId, year, action, value);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div>
      <div className={compact ? "flex gap-1" : "grid grid-cols-4 gap-1.5"}>
        {ITEMS.map(({ action, label, Icon }) => {
          const on = checked[action];
          return (
            <button
              key={action}
              type="button"
              aria-pressed={on}
              aria-label={compact ? label : undefined}
              title={compact ? label : undefined}
              onClick={() => toggle(action)}
              className={cn(
                "flex items-center justify-center border font-medium transition-colors",
                compact ? "size-10 rounded-full" : "h-14 flex-col gap-0.5 rounded-xl text-xs",
                on
                  ? tone === "sun"
                    ? // On the marigold card, done is the card's own ink, so it reads at a glance in both themes.
                      "border-transparent bg-sun-foreground text-sun"
                    : "border-transparent bg-primary text-primary-foreground"
                  : tone === "sun"
                    ? "border-sun-foreground/15 bg-white/50 text-sun-foreground hover:bg-white/80 dark:bg-black/10 dark:hover:bg-black/20"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className={compact ? "size-5" : "size-6"} />
              {!compact && label}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
