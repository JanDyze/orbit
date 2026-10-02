"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NEXT_COOKIE, safeNextPath } from "@/lib/next-path";
import { siteOrigin } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

// Orbit has no sign-up form: you sign in with the Google account you use for Kept. (Google sign-in
// itself makes an account for a Google user Supabase hasn't seen, as it does on Kept; such an account
// isn't in orbit.allowed_users, so it only ever sees the "no access" page.)
export async function signIn(formData: FormData) {
  const next = safeNextPath(formData.get("next")) ?? "/";
  if (next !== "/") (await cookies()).set(NEXT_COOKIE, next, { path: "/", maxAge: 60 * 60 * 24, sameSite: "lax", httpOnly: true });
  const origin = await siteOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect("/login?link=google");
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
