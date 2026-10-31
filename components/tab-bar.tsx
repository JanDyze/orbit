"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AddIcon, CalendarIcon, YearIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

// The phone's bottom bar: a floating rounded bar over the page, your year on one side and the
// calendar on the other, and adding someone in the middle as a raised sun, the one thing you're
// always invited to do. The current page sits in a soft blue pill and its icon plays its little
// animation as you arrive. It lives in the (tabs) layout, so it stays put between the two pages.
export function TabBar() {
  const pathname = usePathname();
  const active = pathname.startsWith("/calendar") ? "calendar" : "home";
  const item = (on: boolean) =>
    cn(
      "flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-sm font-bold transition-colors",
      on ? "bg-orbit-soft text-primary" : "text-muted-foreground hover:text-foreground",
    );
  return (
    <nav aria-label="Main" className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto relative mx-auto flex h-16 max-w-sm items-center gap-2 rounded-full border border-border/70 bg-card/90 px-2 shadow-[0_12px_32px_-12px_oklch(0.4_0.17_262/0.35)] backdrop-blur-xl">
        <Link href="/" aria-current={active === "home" ? "page" : undefined} className={item(active === "home")}>
          <YearIcon className="size-6" />
          Year
        </Link>
        <Link
          href="/people/new"
          transitionTypes={["nav-forward"]}
          aria-label="Add someone"
          className="tab-add relative -my-4 flex size-16 shrink-0 items-center justify-center rounded-full bg-sun text-sun-foreground shadow-[0_8px_20px_-6px_oklch(0.62_0.15_70/0.7)] ring-[5px] ring-background transition-transform active:scale-95"
        >
          <AddIcon className="size-8" />
        </Link>
        <Link href="/calendar" aria-current={active === "calendar" ? "page" : undefined} className={item(active === "calendar")}>
          <CalendarIcon className="size-6" />
          Calendar
        </Link>
      </div>
    </nav>
  );
}
