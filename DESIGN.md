---
name: Orbit
description: Every birthday is one more trip around the sun.
colors:
  royal-orbit: "oklch(0.4 0.17 262)"
  royal-orbit-ink: "oklch(0.985 0.005 85)"
  marigold-sun: "oklch(0.82 0.16 75)"
  sun-ink: "oklch(0.27 0.06 60)"
  sun-soft: "oklch(0.95 0.06 85)"
  orbit-soft: "oklch(0.95 0.03 262)"
  cream-paper: "oklch(0.983 0.008 85)"
  card-white: "oklch(1 0 0)"
  navy-ink: "oklch(0.22 0.03 262)"
  warm-muted: "oklch(0.955 0.012 85)"
  muted-ink: "oklch(0.5 0.025 262)"
  paper-border: "oklch(0.91 0.012 85)"
  field-border: "oklch(0.88 0.015 85)"
  focus-ring: "oklch(0.55 0.15 262)"
  destructive: "oklch(0.577 0.245 27.325)"
  night-navy: "oklch(0.2 0.06 262)"
  night-card: "oklch(0.245 0.065 262)"
  night-orbit: "oklch(0.76 0.11 262)"
  night-sun-soft: "oklch(0.34 0.07 75)"
  night-orbit-soft: "oklch(0.3 0.08 262)"
typography:
  display:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "2.375rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "normal"
    fontFeature: "\"tnum\""
  headline:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 800
    lineHeight: 1.5
    letterSpacing: "-0.025em"
  countdown:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "\"tnum\""
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 600
    lineHeight: 1
rounded:
  lg: "10px"
  xl: "14px"
  2xl: "18px"
  3xl: "22px"
  full: "9999px"
spacing:
  hairline: "2px"
  xs: "4px"
  sm: "8px"
  row: "10px"
  md: "12px"
  gutter: "16px"
  card: "20px"
  section: "24px"
components:
  button-primary:
    backgroundColor: "{colors.royal-orbit}"
    textColor: "{colors.royal-orbit-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    height: "48px"
  button-quiet:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.navy-ink}"
    rounded: "{rounded.xl}"
    height: "48px"
  button-text:
    textColor: "{colors.royal-orbit}"
    typography: "{typography.body-small}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  button-add:
    backgroundColor: "{colors.marigold-sun}"
    textColor: "{colors.sun-ink}"
    rounded: "{rounded.full}"
    size: "56px"
  checklist-tile:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.xl}"
    height: "56px"
  checklist-tile-on:
    backgroundColor: "{colors.royal-orbit}"
    textColor: "{colors.royal-orbit-ink}"
    rounded: "{rounded.xl}"
    height: "56px"
  checklist-tile-sun-on:
    backgroundColor: "{colors.sun-ink}"
    textColor: "{colors.marigold-sun}"
    rounded: "{rounded.xl}"
    height: "56px"
  checklist-dot:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.full}"
    size: "40px"
  today-card:
    backgroundColor: "{colors.marigold-sun}"
    textColor: "{colors.sun-ink}"
    rounded: "{rounded.3xl}"
    padding: "14px 16px 16px"
  card:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.navy-ink}"
    rounded: "{rounded.3xl}"
    padding: "12px"
  orbit-panel:
    backgroundColor: "{colors.orbit-soft}"
    textColor: "{colors.royal-orbit}"
    rounded: "{rounded.3xl}"
    padding: "20px"
  input-field:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.navy-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    height: "48px"
    padding: "0 12px"
  countdown-today-pill:
    backgroundColor: "{colors.marigold-sun}"
    textColor: "{colors.sun-ink}"
    rounded: "{rounded.full}"
    height: "44px"
    width: "56px"
  action-chip:
    backgroundColor: "{colors.orbit-soft}"
    textColor: "{colors.royal-orbit}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  tab-bar:
    backgroundColor: "{colors.cream-paper}"
    textColor: "{colors.muted-ink}"
    height: "56px"
---

# Design System: Orbit

## Overview

**Creative North Star: "One Trip Around the Sun"**

Orbit is the logo grown to the size of an app. A royal-blue ring with round caps, open at today, with the logo's marigold flame burning in the gap; a marigold sun at the center; cream paper underneath (deep navy at night). Everyone the owner cares about is a bead on that ring at their birthday's angle, so the year is one shape rather than a list. The same ring, at the same geometry, appears on the home dial and in the add flow, and the month grid on the calendar reuses its beads. The orbit is the product's own language, never decoration laid over a generic agenda.

The feel is warm, round and quiet. Faces are rounded (Nunito at extrabold for numbers, names and headings), surfaces are soft-cornered and flat, and the only bright color is the sun. Density is phone-first and calm: one column, big tap targets, few lines per person, and summaries (counted beads, thickened busy weeks, "Show N more") instead of long lists. Motion tells the name's story: the mark's intro draws the ring with a travelling spark that lights the flame, the dial draws the year from today while beads settle in date order, and at rest the flame flickers and the sun breathes. Every animation rests still under reduced motion.

Light and dark follow the phone; there is no theme switch. The browser's own surfaces (selection, caret, scrollbar, theme color) carry the palette, and the app suppresses web-page tells (tap highlight, text selection outside fields, link callouts, image drag) so it behaves like an installed app.

**Key Characteristics:**
- The year is a ring: 360-unit box, radius 124, 13-unit round-capped royal stroke, an 18° gap at today holding the flame.
- Marigold means now: today, the lens in focus, the selected choice, and the one standing invitation (Add).
- Royal blue is structure and "this week": the ring, interactive text, done states, near countdowns.
- Rounded Nunito extrabold for anything you glance at; Geist for anything you read.
- Flat tonal surfaces with generous radii (14px to 22px); depth from paper, card and soft tints, not shadow.
- Motion follows the logo's intro once per app open, then settles to a slow flicker and breath.

## Colors

Three logo colors (royal blue #013FA3, marigold #FCB327, cream #FCF9F2) carried in OKLCH, with a cool-navy ink and warm paper neutrals; dark mode swaps the paper for night navy and lifts the blue.

### Primary
- **Royal Orbit** (`royal-orbit`): the ring, the mark, the wordmark, interactive text links, the primary button, done checklist tiles, the "this week" countdown numeral and today's ring in the month grid. Lifts to **Night Orbit** (`night-orbit`) in dark mode so the ring stays luminous on navy.
- **Orbit Soft** (`orbit-soft`, night `night-orbit-soft`): the blue's pale tint. Hover ground for text buttons, the person page's countdown panel, the current month in the year strip, logged-action chips, the "is in your orbit" confirmation.

### Secondary
- **Marigold Sun** (`marigold-sun`): the sun at the dial's center, the flame, the 30-day lens arc, beads inside the lens, today's card, the "Today" countdown pill, the Add button, the selected day, the current month's bar. Text on it is always **Sun Ink** (`sun-ink`), a deep brown, never white.
- **Sun Soft** (`sun-soft`, night `night-sun-soft`): days that hold birthdays in the month grid.

### Neutral
- **Cream Paper** (`cream-paper`): the page ground and the tab and header bars (at 85 to 90% with blur). Night: **Night Navy** (`night-navy`).
- **Card White** (`card-white`): cards, fields, resting checklist tiles. Night: **Night Card** (`night-card`), one step lighter than the ground.
- **Navy Ink** (`navy-ink`): body text; a navy-tinted near-black rather than gray. Night text is a warm off-white.
- **Warm Muted** (`warm-muted`): row hover ground and empty-state panels.
- **Muted Ink** (`muted-ink`): secondary lines, month ticks and labels, inactive tabs.
- **Paper Border** (`paper-border`) and **Field Border** (`field-border`): hairlines on cards and dividers, and the slightly stronger field stroke. Night borders are white at 10% and 14%.
- **Focus Ring** (`focus-ring`): the 3px focus halo, at 50% alpha.
- **Destructive** (`destructive`): errors and delete, used as text on a 10% tint of itself.

### Named Rules
**The Sun Means Now Rule.** Marigold marks what is happening now or what is in focus: today, the lens, the current choice, and the Add invitation. Upcoming-but-not-today is blue; everything else is ink on paper. If marigold appears, something on that spot is today or selected.

**The Brown Ink Rule.** Anything set on marigold uses Sun Ink, and "done" on a marigold card inverts to Sun Ink ground with marigold text, so state reads in both themes.

## Typography

**Display Font:** Nunito (with ui-rounded, system-ui)
**Body Font:** Geist (with system-ui)

**Character:** Nunito's rounded terminals echo the logo's lettering and the ring's round caps; Geist keeps running text and small labels crisp and neutral.

### Hierarchy
- **Display** (Nunito 800, 38px at the dial's 360 scale, line-height 1, tabular): the countdown numeral inside the sun. Drops to 26px when the word is longer than three characters ("Today", a month name).
- **Headline** (Nunito 800, 1.875rem; 1.6rem on today's card, tight tracking): the person page's countdown line, today's name, the add flow's name field.
- **Title** (Nunito 800, 1.125rem to 1.5rem, tight tracking): the lens label ("Next 30 days"), the calendar's month heading, list headings. Section titles drop to 1rem. Page titles in the header bar use 700 at 1.25rem.
- **Countdown** (Nunito 800, 1.5rem, tabular, line-height 1): the number that leads each row, with a Geist 0.65rem semibold "days" under it.
- **Body** (Geist 400 to 500, 1rem): names in rows (500), form text. Inputs stay at 1rem so iOS never zooms.
- **Body Small** (Geist 400, 0.875rem): the detail line under a name ("Thu, Oct 9 · turns 31").
- **Label** (Geist 600 to 700, 0.65rem to 0.7rem): tab labels, weekday initials, the small unit under a countdown.

### Named Rules
**The Rounded Glance Rule.** Numbers, names in focus and headings are Nunito at 700 to 800; sentences and details are Geist. Nunito never sets a paragraph.

**The Tabular Count Rule.** Every countdown, date numeral and bead count uses tabular figures so they don't jitter while the dial turns.

## Layout

One phone-width column on every screen: max 36rem (`max-w-xl`), centered, 16px gutters. A sticky header bar (56px plus the top safe-area inset) holds the mark and wordmark, or a back chevron and the page title. On the main pages a fixed bottom bar (56px plus the bottom safe-area inset) holds Year, a raised Add and Calendar; main content pads 7rem plus the inset to clear it. Desktop is the same column, not a reflowed layout.

Rhythm: 24px between major blocks, 12px between stacked cards, 10px vertical padding in list rows, 16 to 20px inside cards. Lists are flat rows on paper with a 12px gap between lead and text; grouped content sits in one bordered card with internal dividers.

The year dial fills the column, capped at 26rem; when today's or pending cards sit above it on a phone it caps at 21rem so more of the ring reaches the first screen. The add flow's ring caps at 22.5rem.

## Elevation & Depth

Flat and tonal. Depth comes from three layers (cream paper, white or night card, soft blue or marigold tint) plus hairline borders. Bars float with translucency and a 12px backdrop blur over a hairline, not with shadow.

### Shadow Vocabulary
- **Sun lift** (`box-shadow: 0 6px 16px -4px oklch(0.6 0.15 70 / 0.55)`): only under the raised Add button, together with a 4px ring in the page color that cuts it out of the bar.
- **Choice lift** (`box-shadow: 0 2px 6px -2px oklch(0.3 0.05 262 / 0.35)`): month choices sitting on the add flow's ring, so they read as tappable pieces above the stroke.

### Named Rules
**The Paper Not Plastic Rule.** Cards and tiles never cast shadows; separation is a tonal step or a hairline. A shadow is reserved for something that sits physically above the ring or the bar.

## Shapes

Round everywhere, following the ring. The radius base is 10px; controls and tiles use 14px, rows and panels 18px, cards 22px, and anything that is a point on the orbit (beads, the sun, the Add button, the Today pill, countdown chips, icon buttons for turning the dial) is a full circle. Strokes are round-capped. The ring is always open at today with the flame in the gap; it is never drawn as a closed circle.

## Components

### Buttons
Soft, generous, thumb-sized.
- **Shape:** gently rounded (14px), 48px tall, full width in forms.
- **Primary:** royal ground, cream ink, medium to semibold; hover drops to 90% opacity.
- **Quiet:** card ground with a field-border stroke, ink text; hover to warm muted (sign-in with Google, sign-out).
- **Text:** royal text in a full pill, orbit-soft ground on hover ("Back to today", "Show 2 more", "Back to this month").
- **Icon:** 40 to 44px round or 14px-cornered, muted ink, warm muted on hover.
- **Destructive:** destructive text on a 10% tint, 48px, 14px corners.
- **Focus:** 3px focus-ring halo at 50%. Disabled drops opacity.

### The Add Button
The bar's one raised element: a 56px marigold circle with a 28px Sun Ink plus at 2.5 stroke, lifted 20px above the bar, cut out by a 4px page-colored ring and carrying the Sun lift shadow. It scales to 95% on press.

### Checklist (Greeted, Prayed, Gifted, Celebrated)
One tap per action, optimistic, reverting with a message if saving fails.
- **Full:** four equal 56px tiles in a row, 14px corners, icon over label. Resting: card ground, hairline, muted ink. Done: royal ground, cream ink.
- **On today's card (sun tone):** resting tiles are white at 50% with a faint Sun Ink border (black at 10% at night); done inverts to Sun Ink ground with marigold icon and text.
- **Compact:** 40px circles, icons only, labels kept for screen readers (the pending list).

### Cards / Containers
- **Today card:** marigold ground, Sun Ink, 22px corners; the name in headline Nunito, the age line at 80% opacity, then the full checklist.
- **Card:** card ground, hairline border, 22px corners, 12px padding (the pending list, the month grid). Smaller grouped lists use 18px corners.
- **Orbit panel:** orbit-soft ground, 22px corners, 20px padding; the person page's countdown (marigold when it's today).
- **Empty state:** warm muted panel, 18px corners, centered small text.

### Inputs / Fields
- **Style:** 48px (44px inline), 14px corners, field-border stroke, card ground (night: white at 14%), 1rem text.
- **Focus:** border shifts to the focus ring color with a 3px halo at 50%.
- **Error:** destructive border and halo; the message sits under the field in destructive text.
- **The name field in the add flow** is the exception by design: no box, a 2px bottom rule, headline Nunito, turning royal on focus.

### Navigation
- **Header:** cream at 85% with blur, hairline below; the mark (full intro once per app open, then flicker) beside the wordmark, whose dotless i carries a marigold dot.
- **Tab bar:** cream at 90% with blur, hairline above; three slots. Active is royal; inactive is muted ink, and the Year tab's mark goes grayscale at 55% when inactive and never animates.

### Birthday Row
The upcoming list's unit. Leads with the countdown, not a date badge: a tabular Nunito numeral over "days" in royal for this week and ink beyond it, or a marigold "Today" pill. Name at medium weight with the first nickname muted after a middle dot, the detail line in body small, and a faint chevron. The whole row is the link; it fills warm muted on hover and press, with 18px corners.

### Year Dial (signature)
The home screen's year as one orbit. Month ticks and three-letter uppercase month names sit outside the ring; the marigold lens arc (6-unit stroke) rides just outside the ring over the next 30 days; people are beads on the ring. Birthdays two days apart or less merge into one bead (never spanning more than a week), and three or more show their count in royal Nunito. A week with four or more birthdays thickens the ring under it, by up to 6 units, staying 9 days clear of the flame. Beads inside the lens turn marigold. When someone's birthday is today the flame grows and a marigold glow breathes behind it. The sun holds the countdown to the next birthday and the person's short name; turned away from today it holds the month and how many fall in the lens. Dragging the ring, the side chevrons or the arrow keys turn the year under the lens and snap to a day with an exponential ease-out (280 to 700ms); "Back to today" springs it back. The list under the dial follows the lens.

### Add Flow (signature)
Adding someone places them on the same ring. Months appear round the ring as pill choices, staggered by 25ms; picking one dims the year, draws that month's stretch of the ring, and lays its days round the ring (staggered by 12ms). The chosen day is marigold with a royal ring, and the person's bead drops onto the ring where they will sit on the home dial. The sun narrates the choice so far.

### Month Calendar
Seven-column grid in a card; each day is a 14px-cornered square. Days with birthdays are sun-soft and bold, with up to three royal dots (a "+" past three); today has an inset royal ring; the selected day is royal with marigold dots. Above it, a 12-month strip shows each month's share of birthdays as a rounded bar, marigold for the current month and royal at 45% otherwise.

## Do's and Don'ts

### Do:
- **Do** draw any view of the year with the shared ring: 360 box, radius 124, 13-unit round-capped stroke, the gap and flame at today.
- **Do** keep marigold for now and focus (today, the lens, the selection, Add) and set Sun Ink on it.
- **Do** lead a person's row with how far away they are, in tabular Nunito extrabold.
- **Do** summarise crowds: merged and counted beads, thickened busy weeks, "Show N more" past two pending.
- **Do** separate surfaces with tonal steps and hairlines, with corners from 14px (controls) to 22px (cards) and full circles for anything on the orbit.
- **Do** give every animation a still rest under reduced motion, and play intros once per app open, never on every navigation.
- **Do** use `cubic-bezier(0.16, 1, 0.3, 1)` for things arriving and `cubic-bezier(0.65, 0, 0.35, 1)` for strokes drawing.

### Don't:
- **Don't** close the ring or move the gap away from today; the open ring with the flame is the logo.
- **Don't** set white text on marigold, or use marigold for upcoming-but-not-today.
- **Don't** add drop shadows to cards, rows or tiles; only the Add button and the add flow's ring choices lift.
- **Don't** set paragraphs in Nunito or headings in Geist.
- **Don't** use uppercase beyond three-letter month and weekday abbreviations.
- **Don't** add a theme switch; light and dark follow the phone.
