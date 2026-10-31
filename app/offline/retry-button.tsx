"use client";

export function RetryButton() {
  return (
    <button type="button" onClick={() => window.location.reload()} className="h-12 w-full rounded-xl bg-primary font-medium text-primary-foreground hover:bg-primary/90">
      Try again
    </button>
  );
}
