"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { saveGiftNote, type GiftNoteState } from "@/app/people/log-actions";

// What was given for this birthday, kept on that year's log row.
export function GiftNoteForm({ personId, year, giftNote }: { personId: string; year: number; giftNote: string | null }) {
  const [state, formAction, pending] = useActionState<GiftNoteState, FormData>(saveGiftNote, {});
  return (
    <form action={formAction} className="flex flex-col gap-1.5">
      <input type="hidden" name="personId" value={personId} />
      <input type="hidden" name="year" value={year} />
      <label htmlFor="giftNote" className="text-sm font-medium">
        Gift note <span className="font-normal text-muted-foreground">(optional)</span>
      </label>
      <div className="flex gap-2">
        <input
          id="giftNote"
          name="giftNote"
          key={giftNote ?? ""}
          defaultValue={giftNote ?? ""}
          placeholder="What you gave"
          autoComplete="off"
          className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-sm font-medium hover:bg-muted disabled:opacity-70"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : state.saved ? <Check className="size-4 text-primary" aria-hidden /> : null}
          Save
        </button>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
