---
version: 1
slug: "app-page-tsx"
primary_target: "app/(tabs)/page.tsx"
related_targets: ["app/(tabs)/calendar/page.tsx","app/people/page.tsx","app/people/new/page.tsx"]
---

Scope: Orbit home (`/`), with the calendar (`/calendar`) and add flow (`/people/new`) joining it. Mode: Operate.
Audience and job: the owner on their phone, 200+ people. Act on today and the last 7 days, and look ahead; both jobs share the first screen. Adding happens in batches and one at a time.

## Direction contract

THESIS: The year is one orbit. Everyone sits on a single ring at their birthday's angle, and today is the logo's flame in the gap at the top. This refuses the category default of a stacked agenda list with a date badge per row.

OWN-WORLD: The logo's materials at app scale: a royal-blue #013FA3 ring with a round-capped stroke, marigold #FCB327 for the sun, the flame and anything happening now or soon, on a cream #FCF9F2 ground (deep navy in dark mode). Rounded Nunito display, Geist text. People are beads on the ring, and busy weeks thicken into clusters.

STORY: Opening Orbit shows where you are in the year and who is next. If today or the last few days hold birthdays, their one-tap checklist sits above the dial. Turning the dial moves a marigold lens along the year, and the list under it follows. Adding someone means placing them on the same ring.

FIRST VIEWPORT: The header holds the mark and "Orbit". The dial fills the width: month ticks outside, beads on the ring, the flame at the top marking today, a marigold lens arc over the next 30 days. The sun at the center holds the countdown to the next birthday ("3 days", "Maria"). Under the dial: "Next 30 days" and the lens list. A bottom bar holds Home, Calendar and a sun-colored Add.

FORM: Year dial, my #1 of 7 (not dealt in the lead; the user delegated the choice), seed f821a2c9. Raised by Launch board: the sun carries the next-birthday countdown.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: drag the dial to turn the year under the lens, which snaps to a day; "Today" springs it back. Motion: on load, beads settle onto the ring in date order behind the flame, following the logo's intro.
