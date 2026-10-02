import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { NEXT_COOKIE, safeNextPath } from "@/lib/next-path";
import { siteOrigin } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

// Where Google sign-in comes back to: it signs the user in, then carries on to `next` (or the page
// the proxy remembered in a cookie when `next` got lost on the way).
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const asked = safeNextPath(url.searchParams.get("next"));
  const remembered = safeNextPath(request.cookies.get(NEXT_COOKIE)?.value);
  const next = asked && asked !== "/" ? asked : (remembered ?? "/");
  const origin = await siteOrigin();
  // Google came back without signing in, e.g. the user tapped Cancel.
  if (url.searchParams.has("error")) return NextResponse.redirect(new URL("/login?link=cancelled", origin));

  const supabase = await createClient();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("missing token") };

  const response = NextResponse.redirect(new URL(error ? "/login?link=expired" : next, origin));
  if (!error) response.cookies.delete(NEXT_COOKIE);
  return response;
}
