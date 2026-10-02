"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";
import { removePerson } from "@/app/people/actions";

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 font-medium text-destructive hover:bg-destructive/15 disabled:opacity-70"
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
      Delete from Orbit
    </button>
  );
}

// Deleting takes their gift ideas and birthday history with them, so it asks first.
export function DeletePersonButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={removePerson}
      onSubmit={(e) => {
        if (!window.confirm(`Delete ${name}? Their gift ideas and birthday history go too.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <DeleteButton />
    </form>
  );
}
