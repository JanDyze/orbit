"use client";

import { OrbitMark } from "@/components/orbit-mark";

// Something on the server failed: most likely the connection, or the `orbit` schema not being in
// the Data API's exposed schemas yet.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12 text-center">
      <OrbitMark className="mx-auto mb-6 size-14 opacity-60" />
      <h1 className="font-brand text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">Check your connection and try again.</p>
      {error.digest && <p className="mt-1 text-xs text-muted-foreground">Error {error.digest}</p>}
      <button type="button" onClick={reset} className="mt-8 h-12 w-full rounded-xl bg-primary font-medium text-primary-foreground hover:bg-primary/90">
        Try again
      </button>
    </main>
  );
}
