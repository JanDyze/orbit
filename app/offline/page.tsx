import type { Metadata } from "next";
import { OrbitMark } from "@/components/orbit-mark";
import { RetryButton } from "./retry-button";

export const metadata: Metadata = { title: "Offline" };

// What the service worker (public/sw.js) shows for a page it has no copy of while there's no
// connection. The address bar keeps the page asked for, so "Try again" reloads that page. Pages
// opened before are kept, so the year usually still opens.
export default function OfflinePage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12 text-center">
      <OrbitMark className="mx-auto mb-6 size-20" motion="idle" />
      <h1 className="font-brand text-2xl font-extrabold tracking-tight">No connection</h1>
      <p className="mt-2 text-muted-foreground">This page needs the internet the first time. Your year and anyone you&apos;ve opened before still work offline.</p>
      <div className="mt-8 flex flex-col gap-3">
        <RetryButton />
        {/* A full page load, so the service worker can answer it with the kept copy; a client-side
            <Link> would wait on the network. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className="flex h-12 items-center justify-center rounded-xl border border-input bg-card font-medium hover:bg-muted">
          Open your year
        </a>
      </div>
    </main>
  );
}
