"use client";

import { useActionState, useEffect, useOptimistic, useRef, useTransition } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";
import { addGift, removeGift, toggleGift, type GiftFormState } from "@/app/people/actions";
import { cn } from "@/lib/utils";

type Idea = { id: string; idea: string; given: boolean };

// Gift ideas for someone: jot one down, tick it off once given, or let it go.
export function GiftIdeas({ personId, ideas }: { personId: string; ideas: Idea[] }) {
  const [state, formAction, adding] = useActionState<GiftFormState, FormData>(addGift, {});
  const inputRef = useRef<HTMLInputElement>(null);
  const [shown, change] = useOptimistic(ideas, (list, c: { id: string; given?: boolean; removed?: boolean }) =>
    c.removed ? list.filter((i) => i.id !== c.id) : list.map((i) => (i.id === c.id ? { ...i, given: c.given ?? i.given } : i)),
  );
  const [, startTransition] = useTransition();

  // After an idea is added, keep the keyboard up for the next one.
  useEffect(() => {
    if (state.ok) inputRef.current?.focus();
  }, [state.ok]);

  return (
    <div className="flex flex-col gap-3">
      <form action={formAction} className="flex gap-2">
        <input type="hidden" name="personId" value={personId} />
        <input
          ref={inputRef}
          name="idea"
          placeholder="A gift idea…"
          autoComplete="off"
          aria-label="New gift idea"
          className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        />
        <button
          type="submit"
          disabled={adding}
          aria-label="Add gift idea"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
        >
          {adding ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Plus className="size-5" aria-hidden />}
        </button>
      </form>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {shown.length > 0 && (
        <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
          {shown.map((idea) => (
            <li key={idea.id} className="flex items-center gap-1 py-1 pr-1 pl-1">
              <button
                type="button"
                aria-pressed={idea.given}
                aria-label={idea.given ? `Mark “${idea.idea}” as not given` : `Mark “${idea.idea}” as given`}
                onClick={() =>
                  startTransition(async () => {
                    change({ id: idea.id, given: !idea.given });
                    await toggleGift(idea.id, personId, !idea.given);
                  })
                }
                className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-muted"
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                    idea.given ? "border-primary bg-primary text-primary-foreground" : "border-input",
                  )}
                >
                  {idea.given && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
                </span>
                <span className={cn("min-w-0 break-words", idea.given && "text-muted-foreground line-through")}>{idea.idea}</span>
              </button>
              <button
                type="button"
                aria-label={`Delete “${idea.idea}”`}
                onClick={() =>
                  startTransition(async () => {
                    change({ id: idea.id, removed: true });
                    await removeGift(idea.id, personId);
                  })
                }
                className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
