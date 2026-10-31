import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { NEXT_COOKIE, safeNextPath } from "@/lib/next-path";

// Pages anyone may open. /offline holds no data; the service worker keeps a copy to show when
// there's no connection.
const PUBLIC_PATHS = ["/login", "/auth", "/offline"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// Refreshes the Supabase session cookie on every request and sends signed-out visitors to /login.
// This is the optimistic check: pages and actions still call requireAccess(), which also checks
// orbit.allowed_users (a database call the proxy doesn't make on every request).
export async function updateSession(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  // Supabase falls back to the Site URL (/?code=...) when the redirect isn't allowed-listed.
  if (pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/confirm";
    url.search = `?code=${encodeURIComponent(request.nextUrl.searchParams.get("code")!)}&next=/`;
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Don't run code between createServerClient and getClaims: it can sign people out at random.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  if (!signedIn && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    const next = pathname + search;
    url.pathname = "/login";
    url.search = next === "/" ? "" : `?next=${encodeURIComponent(next)}`;
    const redirect = NextResponse.redirect(url);
    if (next !== "/") redirect.cookies.set(NEXT_COOKIE, next, { path: "/", maxAge: 60 * 60, sameSite: "lax", httpOnly: true });
    return redirect;
  }

  if (signedIn && pathname === "/login") {
    const target = new URL(safeNextPath(request.nextUrl.searchParams.get("next")) ?? "/", "http://orbit");
    const url = request.nextUrl.clone();
    url.pathname = target.pathname;
    url.search = target.search;
    return NextResponse.redirect(url);
  }

  return response;
}
