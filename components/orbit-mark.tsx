"use client";

import { useId } from "react";
import { LOGO_FLAME_D, LOGO_RING, LOGO_RING_D, LOGO_SUN } from "@/components/orbit-mark-paths";
import { cn } from "@/lib/utils";

export type MarkMotion = "intro" | "idle" | "still";

// The logo's mark as SVG, traced from brand/orbit-logo.png (components/orbit-mark-paths.ts): the
// blue ring with its scooped ends, the pointed flame with its tongue cut through, and the sun. The
// traced shapes keep the logo's pixels; a group scales them into the 100-unit box that the motion
// in globals.css ("Orbit mark") is written for: ring centered at (50, 52), radius 36.
//
// motion="intro" tells the name's story, one trip around the sun: the sun rises, a spark makes one
// revolution while a mask draws the ring in behind it, and on reaching the gap it lights the flame.
// After that, and with motion="idle", the flame flickers and the sun breathes. "still" is for the
// tab bar. Reduced motion shows it at rest.

const SCALE = 36 / LOGO_RING.r;
const TO_UNITS = `translate(50 52) scale(${SCALE}) translate(${-LOGO_RING.cx} ${-LOGO_RING.cy})`;
const SUN = { cx: 50 + (LOGO_SUN.cx - LOGO_RING.cx) * SCALE, cy: 52 + (LOGO_SUN.cy - LOGO_RING.cy) * SCALE, r: LOGO_SUN.r * SCALE };
// The ring runs counterclockwise from its upper end (27° clockwise from the top) round to its lower
// end (55°); the reveal follows that line, wide enough to cover the ring's full width.
const RING_LINE = "M66.34 19.92 A36 36 0 1 0 79.49 31.35";

export function OrbitMark({ className, motion = "idle" }: { className?: string; motion?: MarkMotion }) {
  const maskId = `orbit-ring-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const intro = motion === "intro";
  return (
    <svg viewBox="0 0 100 100" className={cn("orbit-mark size-8 overflow-visible", className)} data-motion={motion} aria-hidden>
      {intro && (
        <mask id={maskId} maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">
          <path className="om-ring" d={RING_LINE} pathLength={100} fill="none" stroke="#fff" strokeWidth={20} strokeLinecap="round" />
        </mask>
      )}
      <circle className="om-glow" cx={SUN.cx} cy={SUN.cy} r={SUN.r} fill="var(--sun)" />
      <g mask={intro ? `url(#${maskId})` : undefined}>
        <path transform={TO_UNITS} d={LOGO_RING_D} fill="var(--primary)" />
      </g>
      {/* Rides the ring's drawing tip; it turns about the sun, which is the ring's center. */}
      <g className="om-spark">
        <circle cx="66.34" cy="19.92" r="4.6" fill="var(--sun)" />
      </g>
      <g className="om-flame">
        <path transform={TO_UNITS} d={LOGO_FLAME_D} fill="var(--sun)" fillRule="evenodd" />
      </g>
      <circle className="om-sun" cx={SUN.cx} cy={SUN.cy} r={SUN.r} fill="var(--sun)" />
    </svg>
  );
}
