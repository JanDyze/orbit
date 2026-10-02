"use client";

import { useActionState, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { savePerson, type PersonFormState } from "@/app/people/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { maxDayOfMonth, MONTHS } from "@/lib/birthdays/dates";
import { cn } from "@/lib/utils";

export type PersonDefaults = {
  id?: string;
  name?: string;
  birthMonth?: number;
  birthDay?: number;
  birthYear?: number | null;
  nicknames?: string[];
  notes?: string | null;
};

const selectClass =
  "h-12 w-full appearance-none rounded-xl border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30";
const fieldClass = "h-12 rounded-xl bg-card px-3 text-base dark:bg-input/30";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  );
}

// Add or edit someone. Only the name and the birthday's month and day are required.
// Submitted by hand rather than through `action`, so a form with errors keeps what was typed
// (React resets a form after its action runs).
export function PersonForm({ person = {}, submitLabel }: { person?: PersonDefaults; submitLabel: string }) {
  const [state, formAction, pending] = useActionState<PersonFormState, FormData>(savePerson, {});
  const [, startTransition] = useTransition();
  const [month, setMonth] = useState(person.birthMonth ? String(person.birthMonth) : "");
  const [day, setDay] = useState(person.birthDay ? String(person.birthDay) : "");
  const errors = state.errors ?? {};
  const days = maxDayOfMonth(Number(month) || 1);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="flex flex-col gap-6"
    >
      {person.id && <input type="hidden" name="id" value={person.id} />}

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={person.name ?? ""}
          autoComplete="off"
          autoCapitalize="words"
          autoFocus={!person.id}
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={fieldClass}
        />
        <FieldError id="name-error" message={errors.name} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="nicknames">
          Nicknames <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="nicknames"
          name="nicknames"
          defaultValue={(person.nicknames ?? []).join(", ")}
          placeholder="What you call them, e.g. Mai, Ria"
          autoComplete="off"
          autoCapitalize="words"
          aria-invalid={Boolean(errors.nicknames)}
          aria-describedby={errors.nicknames ? "nicknames-error" : "nicknames-hint"}
          className={fieldClass}
        />
        {errors.nicknames ? (
          <FieldError id="nicknames-error" message={errors.nicknames} />
        ) : (
          <p id="nicknames-hint" className="text-xs text-muted-foreground">
            Separate several with commas.
          </p>
        )}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Birthday</legend>
        <div className="grid grid-cols-[1.6fr_1fr_1.2fr] gap-2">
          <select
            name="birthMonth"
            aria-label="Month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              // Keep the day possible in the new month (Apr 31 → Apr 30).
              if (Number(day) > maxDayOfMonth(Number(e.target.value) || 1)) setDay(String(maxDayOfMonth(Number(e.target.value))));
            }}
            aria-invalid={Boolean(errors.birthMonth)}
            className={cn(selectClass, !month && "text-muted-foreground")}
          >
            <option value="" disabled>
              Month
            </option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            name="birthDay"
            aria-label="Day"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            aria-invalid={Boolean(errors.birthDay)}
            className={cn(selectClass, !day && "text-muted-foreground")}
          >
            <option value="" disabled>
              Day
            </option>
            {Array.from({ length: days }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          <Input
            name="birthYear"
            aria-label="Year (optional)"
            placeholder="Year?"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            defaultValue={person.birthYear ?? ""}
            aria-invalid={Boolean(errors.birthYear)}
            className={fieldClass}
          />
        </div>
        <p className="text-xs text-muted-foreground">Don&apos;t know the year? Leave it empty. With it, Orbit shows the age they&apos;re turning.</p>
        <FieldError id="month-error" message={errors.birthMonth ?? errors.birthDay ?? errors.birthYear} />
      </fieldset>


      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={person.notes ?? ""} rows={3} placeholder="Likes, sizes, kids' names…" className="rounded-xl bg-card px-3 text-base dark:bg-input/30" />
        <FieldError id="notes-error" message={errors.notes} />
      </div>

      {errors.form && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errors.form}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
      >
        {pending && <Loader2 className="size-5 animate-spin" aria-hidden />}
        {submitLabel}
      </button>
    </form>
  );
}
