"use client";

import { useEffect, useState } from "react";
import { OrbitMark } from "@/components/orbit-mark";

// Whether the header's intro has played since the app was opened. Module state lives as long as
// the page does, so moving between pages doesn't replay it, but opening the app again does.
let introPlayed = false;

// The header's mark: the full intro the first time, just the flicker after that.
export function BrandMark({ className }: { className?: string }) {
  const [motion] = useState<"intro" | "idle">(() => (introPlayed ? "idle" : "intro"));
  useEffect(() => {
    introPlayed = true;
  }, []);
  return <OrbitMark className={className} motion={motion} />;
}
