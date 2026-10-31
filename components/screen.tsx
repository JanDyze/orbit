import Link from "next/link";
import { ViewTransition } from "react";
import { BackButton } from "@/components/back-button";
import { BrandMark } from "@/components/brand-mark";
import { Wordmark } from "@/components/wordmark";
import { cn } from "@/lib/utils";

// Page frame: a sticky top bar (the Orbit wordmark, or a back arrow and the page's title) and the
// page's column below it, phone-width on every screen. `tabBar` leaves room for the bottom bar
// that the (tabs) layout draws. `back` is where the arrow goes when there's no earlier page.
//
// Moving deeper (into a person, adding someone) slides the page in from the right; the back arrow
// slides it back. Links mark which way they go with transitionTypes; the header stays put.
export function Screen({
  back,
  title,
  action,
  tabBar = false,
  className,
  children,
}: {
  back?: string;
  title?: React.ReactNode;
  action?: React.ReactNode;
  tabBar?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-md [view-transition-name:site-header]">
        <div className="mx-auto flex h-14 w-full max-w-xl items-center justify-between gap-3 px-4">
          {back ? (
            <div className="flex min-w-0 items-center gap-1">
              <BackButton href={back} />
              {title && <h1 className="truncate font-brand text-xl font-bold tracking-tight">{title}</h1>}
            </div>
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <BrandMark className="size-8" />
              <Wordmark className="text-2xl" />
            </Link>
          )}
          {action}
        </div>
      </header>
      <ViewTransition enter={DIRECTIONAL} exit={DIRECTIONAL} default="none">
        <main
          className={cn(
            "mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pt-5",
            tabBar ? "pb-[calc(8rem+env(safe-area-inset-bottom))]" : "pb-[max(3rem,env(safe-area-inset-bottom))]",
            className,
          )}
        >
          {children}
        </main>
      </ViewTransition>
    </>
  );
}

// Only navigations that say which way they go animate; refreshes, tab switches and the browser's
// own back don't.
const DIRECTIONAL = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" };

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("mb-2 px-1 font-brand text-base font-extrabold tracking-tight", className)}>{children}</h2>;
}
