"use client";

import { useEffect, useState } from "react";
import { useOffline } from "next/offline";
import { cn } from "@/lib/utils";

// A quiet pill under the header while the connection is gone: the ring with its flame out. Taps
// still show at once; Next.js holds the saves and sends them when the connection is back
// (experimental.useOffline), and the flame lights again for a moment to say so.
export function OfflineNotice() {
  const offline = useOffline();
  const [shown, setShown] = useState<"offline" | "back" | null>(null);
  const [was, setWas] = useState(offline);
  if (offline !== was) {
    setWas(offline);
    setShown(offline ? "offline" : "back");
  }

  useEffect(() => {
    if (shown !== "back") return;
    const timer = setTimeout(() => setShown(null), 2400);
    return () => clearTimeout(timer);
  }, [shown]);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+4rem)] z-40 flex justify-center px-4">
      {shown && (
        <p
          key={shown}
          className={cn(
            "offline-notice flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium shadow-[0_6px_20px_-8px_oklch(0.3_0.05_262/0.35)] backdrop-blur-md",
            shown === "offline" ? "border-border bg-card/95 text-foreground" : "border-transparent bg-orbit-soft/95 text-primary",
          )}
        >
          <svg viewBox="0 0 24 24" className="size-4 shrink-0 overflow-visible" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden>
            <path d="M14.6 3.7 A8.6 8.6 0 1 0 20.3 9.4" />
            {/* Unlit while offline: the flame's outline only. */}
            <path
              className={shown === "back" ? "offline-flame" : "opacity-60"}
              d="M18.6 1.4c.9 1 1.9 2 1.9 3.3a1.9 1.9 0 0 1-3.8 0c0-1.3 1-2.3 1.9-3.3Z"
              fill={shown === "back" ? "var(--sun)" : "none"}
              stroke={shown === "back" ? "none" : "currentColor"}
              strokeWidth={1.4}
            />
          </svg>
          {shown === "offline" ? "Offline. Taps save once you're back." : "Back online"}
        </p>
      )}
    </div>
  );
}
