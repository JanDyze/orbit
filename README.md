# Orbit

Birthdays: who's coming up, and what you did for each one (greeted, prayed, gifted, celebrated).
Every birthday is one more trip around the sun.

Next.js 16 (App Router) + Supabase. Part of the personal app suite; it shares Kept's Supabase
project, with everything in its own `orbit` schema.

## Features (v1)

- **Your year** (`/`): your whole year as one orbit. Everyone is a bead on the ring at their
  birthday, and today is the flame in the gap at the top. Drag the ring (or use the arrows) to move
  the 30-day lens; the list under it follows. The sun counts down to the next birthday. Today's
  birthdays, and ones from the last 7 days with nothing marked yet, sit above the dial with one-tap
  greeted / prayed / gifted / celebrated.
- **Calendar** (`/calendar`): one month at a time, with birthdays as beads on their days and a strip
  showing how busy each month is.
- **Add someone** (`/people/new`): type the name, tap the month on the ring, then the day, and their
  bead lands where it will sit on your year. "Save & add another" is for entering a batch. The year,
  nicknames and notes are optional.
- **Person** (`/people/[id]`): countdown, the checklist and gift note for the nearest birthday,
  gift ideas, notes, nicknames, and past birthdays year by year. Edit or delete from there.

## How it fits together

- **Data**: `supabase/migrations/` holds the whole schema, applied in order. The app
  reaches it through supabase-js as the signed-in user (`lib/supabase/server.ts`), so RLS decides
  everything. A row is visible only if you're in `orbit.allowed_users` **and** you own it.
- **The birthday maths** lives in one place, the SQL functions `orbit.birthday_calendar()` and
  `orbit.pending_birthdays()`. They handle days until, Feb 29 (on Feb 28 in common years) and
  the age turning. They also pick the year a greeting counts for: the nearer of the last and next
  birthday, so a Dec 30 birthday greeted on Jan 2 lands on the year before. "Today" is passed in
  and follows the phone's time zone (`lib/day.ts`, `components/timezone-sync.tsx`).
  `lib/birthdays/calendar.ts` is the only caller. A future pg_cron reminder can call the same
  functions with an explicit `p_user_id`.
- **Access**: `requireAccess()` (`lib/auth.ts`) runs at the top of every page and action. If
  you're signed in but not in `allowed_users`, you see `/no-access`. There's no sign-up form.
- **Name matching** for the coming MCP tools: `lib/birthdays/match.ts` (0, 1 or many matches).

## Setup

1. **Back up first.** The free plan has no point-in-time restore. For example:
   `npx supabase db dump --db-url "<session pooler URL>" -f backup-YYYY-MM-DD.sql`
2. Run the migrations in `supabase/migrations/` in the SQL editor, in order, each as one script:
   `20261002000000_orbit_init.sql`, then `20261002010000_nicknames_no_relationship.sql`. They only
   touch the `orbit` schema. To undo everything: `drop schema orbit cascade;`.
3. Project Settings → Data API → **Exposed schemas**: add `orbit`.
4. Let yourself in: run `supabase/seed-allowed-user.sql` with your email.
5. Authentication → URL Configuration → **Redirect URLs**: add `http://localhost:3000/**` and
   Orbit's production URL. Without them, Google sign-in falls back to the Site URL, which is Kept.
6. `cp .env.example .env.local` and fill in the values. They're the same as Kept's.
7. `npm install`, then `npm run dev`.

Once the migration is applied, you can swap the hand-written types for generated ones:

```
npx supabase gen types typescript --project-id <project-ref> --schema orbit > lib/supabase/database.types.ts
```

## Design

The visual system is in `DESIGN.md` (from the built app), and the product record is in `PRODUCT.md`.
The logo is `brand/orbit-logo.png`. The animated mark (`components/orbit-mark.tsx`) and the dial's
flame use paths traced from it into `components/orbit-mark-paths.ts`; after changing the logo, run
`npm run logo:trace` (potrace) and regenerate the icons in `public/icons/`.

## Scripts

| Script              | What it does         |
| ------------------- | -------------------- |
| `npm run dev`       | Dev server           |
| `npm run build`     | Production build     |
| `npm run lint`      | ESLint               |
| `npm run typecheck` | `tsc --noEmit`       |
| `npm test`          | Vitest (`lib/**/*.test.ts`) |
| `npm run logo:trace` | Re-trace the logo into SVG paths |
