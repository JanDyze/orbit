import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { OrbitMark } from "@/components/orbit-mark";
import { cn } from "@/lib/utils";

export type Tab = "home" | "calendar";

// The phone's bottom bar: your year, the calendar, and adding someone, which sits raised in the
// sun's color as the one thing you're always invited to do.
export function TabBar({ active }: { active: Tab }) {
  const item = (on: boolean) =>
    cn(
      "flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-semibold transition-colors",
      on ? "text-primary" : "text-muted-foreground hover:text-foreground",
    );
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
    >
      <div className="mx-auto flex w-full max-w-xl items-end px-6">
        <Link href="/" aria-current={active === "home" ? "page" : undefined} className={item(active === "home")}>
          <OrbitMark className={cn("size-6", active !== "home" && "opacity-55 grayscale")} motion="still" />
          Year
        </Link>
        <Link
          href="/people/new"
          aria-label="Add someone"
          className="-mt-5 mx-4 flex size-14 shrink-0 items-center justify-center rounded-full bg-sun text-sun-foreground shadow-[0_6px_16px_-4px_oklch(0.6_0.15_70/0.55)] ring-4 ring-background transition-transform active:scale-95"
        >
          <Plus className="size-7" strokeWidth={2.5} aria-hidden />
        </Link>
        <Link href="/calendar" aria-current={active === "calendar" ? "page" : undefined} className={item(active === "calendar")}>
          <CalendarDays className="size-6" aria-hidden />
          Calendar
        </Link>
      </div>
    </nav>
  );
}
