import { z } from "zod";
import { isLeapYear, maxDayOfMonth, MONTHS } from "./dates";

// What a person is made of, checked the same way for the add/edit form and the MCP tools. The
// database has matching CHECK constraints (supabase/migrations) as the last line.

export const ACTIONS = ["greeted", "prayed", "gifted", "celebrated"] as const;
export type BirthdayAction = (typeof ACTIONS)[number];

export type PersonField = "name" | "birthMonth" | "birthDay" | "birthYear" | "nicknames" | "notes";

export type PersonInput = {
  name: string;
  birthMonth: number;
  birthDay: number;
  birthYear: number | null;
  nicknames: string[];
  notes: string | null;
};

// Form fields arrive as strings ("" when left empty), MCP arguments as numbers or nothing.
const blankToNull = (v: unknown) => (v === undefined || v === null || (typeof v === "string" && v.trim() === "") ? null : v);
const optionalText = (max: number) =>
  z.preprocess((v) => (typeof v === "string" ? v.trim() : v), z.preprocess(blankToNull, z.string().max(max).nullable()));
const wholeNumber = (message: string) => z.coerce.number({ error: message }).int({ error: message });

// What you call them: typed as "Mai, Ria" in the form, a list from MCP. Blanks and repeats drop
// out (ignoring case), and so does one that's just their name.
const MAX_NICKNAMES = 10;
const nicknamesSchema = z
  .preprocess(
    (v) => {
      const list = typeof v === "string" ? v.split(",") : (v ?? []);
      return Array.isArray(list) ? list.map((n) => (typeof n === "string" ? n.trim().replace(/\s+/g, " ") : n)).filter((n) => n !== "") : list;
    },
    z
      .array(z.string().max(40, { error: "Keep each nickname under 40 characters." }))
      .max(MAX_NICKNAMES, { error: `Up to ${MAX_NICKNAMES} nicknames.` }),
  )
  .transform((list) => list.filter((n, i) => list.findIndex((m) => m.toLowerCase() === n.toLowerCase()) === i));

export function personSchema(currentYear: number) {
  return z
    .object({
      name: z.string({ error: "Add a name." }).trim().min(1, { error: "Add a name." }).max(120, { error: "That name is too long." }),
      birthMonth: wholeNumber("Pick a month.").min(1, { error: "Pick a month." }).max(12, { error: "Pick a month." }),
      birthDay: wholeNumber("Pick a day.").min(1, { error: "Pick a day." }).max(31, { error: "Pick a day." }),
      birthYear: z.preprocess(
        blankToNull,
        wholeNumber("Enter a year like 1990.")
          .min(1900, { error: "Enter a year from 1900 on." })
          .max(currentYear, { error: "That year hasn't happened yet." })
          .nullable(),
      ),
      nicknames: nicknamesSchema,
      notes: optionalText(2000),
    })
    .superRefine((p, ctx) => {
      if (p.birthDay > maxDayOfMonth(p.birthMonth)) {
        ctx.addIssue({ code: "custom", path: ["birthDay"], message: `${MONTHS[p.birthMonth - 1]} has only ${maxDayOfMonth(p.birthMonth)} days.` });
      } else if (p.birthMonth === 2 && p.birthDay === 29 && p.birthYear != null && !isLeapYear(p.birthYear)) {
        ctx.addIssue({ code: "custom", path: ["birthYear"], message: `${p.birthYear} wasn't a leap year, so it had no February 29.` });
      }
    })
    .transform((p) => ({ ...p, nicknames: p.nicknames.filter((n) => n.toLowerCase() !== p.name.toLowerCase()) }));
}

export type ParseResult = { ok: true; person: PersonInput } | { ok: false; errors: Partial<Record<PersonField, string>> };

export function parsePerson(raw: Record<string, unknown>, currentYear: number): ParseResult {
  const parsed = personSchema(currentYear).safeParse(raw);
  if (parsed.success) return { ok: true, person: parsed.data };
  const errors: Partial<Record<PersonField, string>> = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0] as PersonField;
    errors[field] ??= issue.message;
  }
  return { ok: false, errors };
}

// The first error, for places that show one line (MCP tool results).
export function firstError(errors: Partial<Record<PersonField, string>>) {
  return Object.values(errors)[0] ?? "Something about that person isn't valid.";
}

export const giftIdeaSchema = z.string().trim().min(1, { error: "Add a gift idea." }).max(500, { error: "That idea is too long." });
export const noteSchema = z.preprocess(blankToNull, z.string().trim().max(2000, { error: "That note is too long." }).nullable());
