import { cn } from "@/lib/utils";

// "Orbit" as the logo sets it: rounded, royal blue, with the dot of the i in the sun's marigold.
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-brand leading-none font-extrabold tracking-tight text-primary", className)}>
      <span className="sr-only">Orbit</span>
      <span aria-hidden>
        Orb
        <span className="relative">
          ı<span className="absolute top-[0.13em] left-1/2 size-[0.22em] -translate-x-1/2 rounded-full bg-sun" />
        </span>
        t
      </span>
    </span>
  );
}
