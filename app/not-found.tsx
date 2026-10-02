import Link from "next/link";
import { OrbitMark } from "@/components/orbit-mark";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12 text-center">
      <OrbitMark className="mx-auto mb-6 size-14 opacity-60" />
      <h1 className="font-brand text-2xl font-bold tracking-tight">Not in your orbit</h1>
      <p className="mt-2 text-sm text-muted-foreground">That page or person doesn&apos;t exist, or was deleted.</p>
      <Link href="/" className="mt-8 flex h-12 items-center justify-center rounded-xl bg-primary font-medium text-primary-foreground hover:bg-primary/90">
        Back to upcoming
      </Link>
    </main>
  );
}
