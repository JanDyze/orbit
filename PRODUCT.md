# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One person: the owner. Orbit is personal-only. They use it on their phone, mostly in short visits, to keep up with the birthdays of a large circle: family, church, friends and work. The list will grow past 200 people.

## Product Purpose

Orbit tracks people's birthdays, shows who is coming up, and records what the owner did for each birthday: greeted, prayed, gifted, celebrated. A visit has two equal jobs. First, act on today and the last few days: whose birthday it is or just was, and what's still undone. Second, look ahead so they can prepare. Success means no birthday in the circle passes unnoticed, and each one carries a small record of care.

## Positioning

The name comes from the idea that every birthday is one full revolution around the sun. Orbit treats a birthday as a moment of care to act on (greeting, prayer, gift, celebration) and keeps that history year by year, rather than just sending a calendar reminder.

## Operating Context

- Mostly on a phone, often installed as a PWA. Quick check-ins.
- Adding happens both ways: a big batch at the start (for example from Facebook or an old list), then one at a time on the spot when someone mentions their birthday.
- The birth year is often unknown; month and day are enough.
- Part of a personal app suite (Kept, Abduct, Orbit) that will be reached by an AI assistant over MCP later.

## Capabilities and Constraints

- People: name, nicknames (several), birth month and day, optional birth year, notes.
- Feb 29 birthdays fall on Feb 28 in common years.
- Birthday log: one row per person per year, with greeted / prayed / gifted / celebrated, a gift note and notes.
- Gift ideas per person, which can be marked as given.
- Pending: birthdays from the last 7 days with nothing marked yet.
- The days-until calculation lives in Postgres (`orbit.birthday_calendar`) and is shared by every surface.
- Supabase project shared with Kept; data lives in the `orbit` schema; access is limited to `orbit.allowed_users`.
- Out of scope for v1: reminders or notifications (designed so a pg_cron job can come later) and contact import.
- Undecided: the MCP server (deferred; Kept and Abduct don't have one yet).

## Brand Commitments

- Name: Orbit. Line: "Every birthday is one more trip around the sun."
- Logo: `brand/orbit-logo.png`, a royal-blue ring open at the top right with a small flame in the gap and a marigold sun inside, plus the rounded "Orbit" wordmark. Colors from the logo: blue #013FA3, marigold #FCB327, cream #FCF9F2.
- The owner loves animated logos. Kept, the sibling app, opens with one too.
- Voice: plain, warm, short sentences (shared with Kept).

## Evidence on Hand

- Logo file: `brand/orbit-logo.png`.
- No real people data is in the repo. Never invent names in shipped UI beyond clearly placeholder examples.

## Product Principles

1. Today first, then what's coming: the two jobs share the first screen.
2. Must stay usable with 200+ people: summarise and group rather than list everyone at once.
3. Marking care takes one tap; adding someone needs only a name and a date.
4. Never a nagging feed: unmarked birthdays are gentle prompts, not alarms.
5. The orbit idea is the product's own language, not decoration.
