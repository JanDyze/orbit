import Link from "next/link";
import { SearchIcon } from "@/components/icons";

// The header's way to everyone: search by name, or browse A to Z (/people).
export function FindLink() {
  return (
    <Link
      href="/people"
      transitionTypes={["nav-forward"]}
      aria-label="Find someone"
      className="-mr-2 flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <SearchIcon className="size-[1.375rem]" />
    </Link>
  );
}
