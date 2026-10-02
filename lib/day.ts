import "server-only";
import { cookies } from "next/headers";
import { isTimeZone, localDate } from "@/lib/birthdays/dates";

// The browser stores its time zone in this cookie (components/timezone-sync.tsx), so "today"
// follows the phone's clock rather than the server's.
export const TZ_COOKIE = "orbit-tz";
export const FALLBACK_TZ = "Asia/Manila";

export async function getTimeZone() {
  const tz = (await cookies()).get(TZ_COOKIE)?.value;
  return tz && isTimeZone(tz) ? tz : FALLBACK_TZ;
}

// Today (YYYY-MM-DD) on the phone's clock.
export async function today() {
  return localDate(await getTimeZone());
}
