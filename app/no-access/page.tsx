import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrbitMark } from "@/components/orbit-mark";
import { hasAccess, requireUser } from "@/lib/auth";
import { signOut } from "@/app/login/actions";

export const metadata: Metadata = { title: "No access" };

// For someone signed in (the auth pool is shared with Kept) who isn't in orbit.allowed_users.
export default async function NoAccessPage() {
  const user = await requireUser();
  if (await hasAccess(user.id)) redirect("/");
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12 text-center">
      <OrbitMark className="mx-auto mb-6 size-16 opacity-60" />
      <h1 className="font-brand text-2xl font-bold tracking-tight">Orbit is private</h1>
      <p className="mt-2 text-muted-foreground">
        {user.email ? `${user.email} doesn't have access to this app.` : "This account doesn't have access to this app."}
      </p>
      <form action={signOut} className="mt-8">
        <button type="submit" className="h-12 w-full rounded-xl border border-input bg-card font-medium hover:bg-muted">
          Sign out
        </button>
      </form>
    </main>
  );
}
