import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type SessionUser = { id: string; email: string | null; name: string | null };

// Verifies the session JWT. Cached per request so several callers share one check.
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  const meta = (claims.user_metadata ?? {}) as Record<string, unknown>;
  const name = [meta.full_name, meta.name].find((n): n is string => typeof n === "string" && n.trim() !== "");
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : null, name: name?.trim() ?? null };
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

// Whether the signed-in user is in orbit.allowed_users. The auth pool is shared with Kept, so being
// signed in isn't enough. RLS lets each person read only their own allowed_users row.
export const hasAccess = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("allowed_users").select("user_id").eq("user_id", userId).maybeSingle();
  if (error) {
    // PGRST106: `orbit` isn't in the Data API's exposed schemas yet.
    throw new Error(`Couldn't check Orbit access (${error.code}): ${error.message}`);
  }
  return data !== null;
});

// Use in every page and server action that touches Orbit data. Anyone signed in but not allowed
// gets the plain "no access" page rather than an error.
export async function requireAccess(): Promise<SessionUser> {
  const user = await requireUser();
  if (!(await hasAccess(user.id))) redirect("/no-access");
  return user;
}
