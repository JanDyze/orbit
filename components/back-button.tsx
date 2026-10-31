"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

type NavigationLike = { canGoBack?: boolean };

// The header's back arrow. Back means back: to the calendar if that's where you came from, at the
// same scroll, rather than always to your year. When Orbit was opened straight onto this page
// (a shortcut, a shared link) there's nothing in Orbit to go back to, so it goes to `href`.
export function BackButton({ href }: { href: string }) {
  const router = useRouter();
  return (
    <Link
      href={href}
      transitionTypes={["nav-back"]}
      aria-label="Back"
      onClick={(e) => {
        // The Navigation API knows whether there's an earlier Orbit page in this tab's history;
        // without it (older browsers), the link goes to `href`.
        const navigation = (window as Window & { navigation?: NavigationLike }).navigation;
        if (navigation?.canGoBack) {
          e.preventDefault();
          router.back();
        }
      }}
      className="-ml-2 flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <ChevronLeft className="size-5" aria-hidden />
    </Link>
  );
}
