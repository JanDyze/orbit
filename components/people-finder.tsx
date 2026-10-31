"use client";

import { useDeferredValue, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { BirthdayRowLink } from "@/components/birthday-row";
import { AddIcon, SearchIcon } from "@/components/icons";
import type { BirthdayRow } from "@/lib/birthdays/calendar";
import { normalizeName, searchPeople } from "@/lib/birthdays/match";
import { cn } from "@/lib/utils";

const RAIL_MIN = 24; // below this many people the list is short enough to scroll

function letterOf(row: BirthdayRow) {
  const first = normalizeName(row.name).charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : "#";
}

// Search as you type over everyone (lib/birthdays/match.ts: names and nicknames, accents and typos
// forgiven), or with nothing typed, everyone A to Z under sticky letters, with a rail down the side
// to jump through a long list. Each row is the same as on your year: how far away, then who.
export function PeopleFinder({ rows, initialQuery }: { rows: BirthdayRow[]; initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const deferred = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);

  const sections = useMemo(() => {
    const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    const groups = new Map<string, BirthdayRow[]>();
    for (const row of sorted) {
      const letter = letterOf(row);
      groups.set(letter, [...(groups.get(letter) ?? []), row]);
    }
    return [...groups].sort(([a], [b]) => (a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)));
  }, [rows]);

  const results = useMemo(() => searchPeople(deferred, rows.map((r) => ({ ...r, id: r.personId }))), [deferred, rows]);
  const searching = deferred.trim() !== "";

  function change(value: string) {
    setQuery(value);
    // Kept in the address so going back to the list finds the same search.
    const q = value.trim();
    window.history.replaceState(null, "", q ? `/people?q=${encodeURIComponent(q)}` : "/people");
  }

  return (
    <div className="flex flex-col">
      <div className="sticky top-[calc(env(safe-area-inset-top)+3.5rem)] z-20 -mx-4 -mt-5 bg-background/90 px-4 pt-3 pb-3 backdrop-blur-md">
        <label className="relative block">
          <span className="sr-only">Find someone by name or nickname</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => change(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && query) {
                e.preventDefault();
                change("");
              }
            }}
            placeholder={rows.length > 0 ? `Search ${rows.length === 1 ? "1 person" : `${rows.length} people`}` : "Search"}
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="words"
            spellCheck={false}
            autoFocus
            className="h-12 w-full appearance-none rounded-xl border border-input bg-card pr-11 pl-11 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                change("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </label>
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl bg-muted px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">No one in your orbit yet.</p>
          <AddLink name="" />
        </div>
      ) : searching ? (
        <section aria-label="Search results" aria-live="polite" className="mt-1">
          {results.people.length === 0 ? (
            <div className="mt-3 flex flex-col items-center gap-4 rounded-2xl bg-muted px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">No one called &ldquo;{deferred.trim()}&rdquo;.</p>
              <AddLink name={deferred.trim()} />
            </div>
          ) : (
            <>
              <p className="px-1 pb-1 text-sm text-muted-foreground">
                {results.close ? "No exact match. Close spellings:" : results.people.length === 1 ? "1 person" : `${results.people.length} people`}
              </p>
              <div className="flex flex-col">
                {results.people.map((row) => (
                  <BirthdayRowLink key={row.personId} row={row} />
                ))}
              </div>
              {results.close && (
                <div className="mt-4 flex justify-center">
                  <AddLink name={deferred.trim()} />
                </div>
              )}
            </>
          )}
        </section>
      ) : (
        <div className="relative">
          {sections.map(([letter, people]) => (
            <section key={letter} id={`letter-${letter}`} aria-labelledby={`letter-${letter}-heading`} className="scroll-mt-[calc(env(safe-area-inset-top)+8rem)] [content-visibility:auto] [contain-intrinsic-size:auto_20rem]">
              <h2
                id={`letter-${letter}-heading`}
                className="sticky top-[calc(env(safe-area-inset-top)+8rem)] z-10 -mx-4 bg-background/90 px-5 py-1 font-brand text-sm font-extrabold text-primary backdrop-blur-md"
              >
                {letter}
              </h2>
              <div className={cn("flex flex-col", sections.length > 1 && rows.length >= RAIL_MIN && "pr-5")}>
                {people.map((row) => (
                  <BirthdayRowLink key={row.personId} row={row} />
                ))}
              </div>
            </section>
          ))}
          {rows.length >= RAIL_MIN && sections.length > 1 && <LetterRail letters={sections.map(([letter]) => letter)} />}
        </div>
      )}
    </div>
  );
}

function AddLink({ name }: { name: string }) {
  return (
    <Link
      href={name ? `/people/new?name=${encodeURIComponent(name)}` : "/people/new"}
      transitionTypes={["nav-forward"]}
      className="flex h-11 max-w-full items-center gap-2 rounded-full bg-sun px-4 font-semibold text-sun-foreground transition-transform active:scale-95"
    >
      <AddIcon className="size-5 shrink-0" />
      <span className="truncate">{name ? `Add “${name}”` : "Add someone"}</span>
    </Link>
  );
}

// The letters down the right edge: tap one, or slide a thumb along them, to jump there.
function LetterRail({ letters }: { letters: string[] }) {
  const [active, setActive] = useState<string | null>(null);
  const sliding = useRef(false);

  function jumpTo(letter: string | undefined) {
    if (!letter || letter === active) return;
    setActive(letter);
    document.getElementById(`letter-${letter}`)?.scrollIntoView({ block: "start" });
  }

  function letterAt(e: React.PointerEvent) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    return el instanceof HTMLElement ? el.dataset.letter : undefined;
  }

  return (
    <nav
      aria-label="Jump to letter"
      onPointerDown={(e) => {
        sliding.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        jumpTo(letterAt(e));
      }}
      onPointerMove={(e) => {
        if (sliding.current) jumpTo(letterAt(e));
      }}
      onPointerUp={() => {
        sliding.current = false;
        setActive(null);
      }}
      onPointerCancel={() => {
        sliding.current = false;
        setActive(null);
      }}
      className="fixed top-1/2 right-[max(0.25rem,calc((100vw-36rem)/2-0.5rem))] z-20 flex -translate-y-1/2 touch-none flex-col items-center rounded-full py-1.5 select-none"
    >
      {letters.map((letter) => (
        <button
          key={letter}
          type="button"
          data-letter={letter}
          // Taps and slides are handled above; this is for the keyboard.
          onClick={(e) => {
            if (e.detail === 0) jumpTo(letter);
          }}
          aria-label={`Jump to ${letter}`}
          className={cn(
            "flex h-[1.1rem] w-6 items-center justify-center rounded-full text-[0.7rem] font-bold transition-colors",
            active === letter ? "bg-primary text-primary-foreground" : "text-primary/70 hover:text-primary",
          )}
        >
          {letter}
        </button>
      ))}
    </nav>
  );
}
