import { cn } from "@/lib/utils";

// Orbit's own icons, in one hand: a 24-unit box, 2-unit round strokes in currentColor, and one
// accent (the sun's marigold once "on", currentColor otherwise). Each has a small animation that
// plays when it becomes active (globals.css, "Icons"): it's the icon doing its thing, once.

type IconProps = { className?: string; on?: boolean };

function Svg({ className, on, name, children }: IconProps & { name: string; children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("icon size-6 shrink-0 overflow-visible", `icon-${name}`, on && "icon-on", className)}
      aria-hidden
    >
      {children}
    </svg>
  );
}

// The year: a ring open at the top right, the flame in the gap, the sun inside.
export function YearIcon(props: IconProps) {
  return (
    <Svg {...props} name="year">
      <path className="i-ring" d="M14.6 3.7 A8.6 8.6 0 1 0 20.3 9.4" />
      <path className="i-flame" d="M18.6 1.4c.9 1 1.9 2 1.9 3.3a1.9 1.9 0 0 1-3.8 0c0-1.3 1-2.3 1.9-3.3Z" fill="var(--icon-accent)" stroke="none" />
      <circle className="i-sun" cx="12" cy="12" r="3.4" fill="var(--icon-accent)" stroke="none" />
    </Svg>
  );
}

// A month page with a birthday bead on it.
export function CalendarIcon(props: IconProps) {
  return (
    <Svg {...props} name="calendar">
      <rect x="3.5" y="5" width="17" height="15.5" rx="3.5" />
      <path d="M3.5 10h17" />
      <path className="i-tab-l" d="M8.5 3v4" />
      <path className="i-tab-r" d="M15.5 3v4" />
      <circle className="i-bead" cx="15.6" cy="15.4" r="1.9" fill="var(--icon-accent)" stroke="none" />
    </Svg>
  );
}

// A lens with a bead in it: finding someone on the ring.
export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props} name="search">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
      <circle className="i-bead" cx="10.5" cy="10.5" r="2.4" fill="var(--icon-accent)" stroke="none" />
    </Svg>
  );
}

export function AddIcon(props: IconProps) {
  return (
    <Svg {...props} name="add">
      <g className="i-plus">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </g>
    </Svg>
  );
}

// Greeted: a speech bubble with a heart in it.
export function GreetedIcon(props: IconProps) {
  return (
    <Svg {...props} name="greeted">
      <path className="i-bubble" d="M20.5 11.6a8.4 8.4 0 0 1-12.3 7.4L3.5 20.5l1.5-4.6a8.4 8.4 0 1 1 15.5-4.3Z" />
      <path className="i-heart" d="M12 15.3s-3.4-2-3.4-4.3a1.8 1.8 0 0 1 3.4-.9 1.8 1.8 0 0 1 3.4.9c0 2.3-3.4 4.3-3.4 4.3Z" fill="var(--icon-accent)" stroke="none" />
    </Svg>
  );
}

// Prayed: two hands pressed together, with light above them.
export function PrayedIcon(props: IconProps) {
  return (
    <Svg {...props} name="prayed">
      <g className="i-hands">
        <path d="M12 4.5c-1.4 1.1-2.3 2.9-2.3 4.9v3.9l-3.6 3.6a1.7 1.7 0 0 0 0 2.4l.2.2a1.7 1.7 0 0 0 2.3.1L12 16.5" />
        <path d="M12 4.5c1.4 1.1 2.3 2.9 2.3 4.9v3.9l3.6 3.6a1.7 1.7 0 0 1 0 2.4l-.2.2a1.7 1.7 0 0 1-2.3.1L12 16.5" />
        <path d="M12 4.5v12" />
      </g>
      <g className="i-rays" stroke="var(--icon-accent)">
        <path d="M6.3 5.2 4.8 4" />
        <path d="M17.7 5.2 19.2 4" />
        <path d="M12 1.6v.1" />
      </g>
    </Svg>
  );
}

// Gifted: a box with a bow; the lid pops when given.
export function GiftedIcon(props: IconProps) {
  return (
    <Svg {...props} name="gifted">
      <path d="M5 11.5v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
      <path d="M12 11.5v9" />
      <g className="i-lid">
        <rect x="3.5" y="8" width="17" height="3.5" rx="1.2" />
        <path d="M12 8v3.5" />
        <path className="i-bow" d="M12 8c-1-2.6-4.6-3.4-4.6-1.3C7.4 8 9.6 8 12 8Zm0 0c1-2.6 4.6-3.4 4.6-1.3C16.6 8 14.4 8 12 8Z" fill="var(--icon-accent)" />
      </g>
    </Svg>
  );
}

// Celebrated: a party popper; the confetti flies when celebrated.
export function CelebratedIcon(props: IconProps) {
  return (
    <Svg {...props} name="celebrated">
      <path className="i-cone" d="M3.6 20.4 8.4 8.6l7 7-11.8 4.8Z" />
      <path className="i-cone" d="M6.6 13.2c1.4 1.7 2.6 2.9 4.2 4.2" />
      <g className="i-confetti">
        <circle className="i-c1" cx="14.8" cy="4.6" r="1.1" fill="var(--icon-accent)" stroke="none" />
        <circle className="i-c2" cx="19.6" cy="9.2" r="1.1" fill="var(--icon-accent)" stroke="none" />
        <path className="i-c3" d="M11.6 3.2 12.4 5" />
        <path className="i-c4" d="M18.8 4.4c.6.9.1 1.9 1 2.6" stroke="var(--icon-accent)" />
        <path className="i-c5" d="M19.4 13.2 21 12.6" />
      </g>
    </Svg>
  );
}

// The sound toggle on the dial: a speaker, with waves when sound is on.
export function SoundIcon({ className, on }: IconProps) {
  return (
    <Svg className={className} on={on} name="sound">
      <path d="M4 9.5h3l4.5-3.7v12.4L7 14.5H4z" />
      {on ? (
        <g className="i-waves">
          <path d="M15.2 9.3a3.8 3.8 0 0 1 0 5.4" />
          <path d="M17.9 6.8a7.4 7.4 0 0 1 0 10.4" />
        </g>
      ) : (
        <path d="M15.5 9.5l5 5m0-5-5 5" />
      )}
    </Svg>
  );
}
