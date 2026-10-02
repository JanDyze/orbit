import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { TabBar, type Tab } from "@/components/tab-bar";
import { Wordmark } from "@/components/wordmark";
import { cn } from "@/lib/utils";

export type BackLink = { href: string; label: string };

// Page frame: a sticky top bar (the Orbit wordmark, or a back arrow and the page's title), the
// page's column below it, phone-width on every screen, and on the main pages the bottom bar.
export function Screen({
  back,
  title,
  action,
  tab,
  className,
  children,
}: {
  back?: BackLink;
  title?: string;
  action?: React.ReactNode;
  tab?: Tab;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-xl items-center justify-between gap-3 px-4">
          {back ? (
            <div className="flex min-w-0 items-center gap-1">
              <Link
                href={back.href}
                aria-label={`Back to ${back.label}`}
                className="-ml-2 flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </Link>
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
      <main
        className={cn(
          "mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pt-5",
          tab ? "pb-[calc(7rem+env(safe-area-inset-bottom))]" : "pb-[max(3rem,env(safe-area-inset-bottom))]",
          className,
        )}
      >
        {children}
      </main>
      {tab && <TabBar active={tab} />}
    </>
  );
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("mb-2 px-1 font-brand text-base font-extrabold tracking-tight", className)}>{children}</h2>;
}
