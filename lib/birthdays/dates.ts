// Plain date helpers shared by the app and the MCP tools. Days are "YYYY-MM-DD" strings in the
// user's own time zone; when someone's birthday falls is worked out in SQL (birthday_calendar), and
// these only validate input and put the results into words.

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

// The most days a birthday month can have: February allows the 29th (it shows on the 28th in
// other years).
export function maxDayOfMonth(month: number) {
  if (month === 2) return 29;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function isValidBirthday(month: number, day: number, year?: number | null) {
  if (!Number.isInteger(month) || month < 1 || month > 12) return false;
  if (!Number.isInteger(day) || day < 1 || day > maxDayOfMonth(month)) return false;
  if (year != null && month === 2 && day === 29 && !isLeapYear(year)) return false;
  return true;
}

export function isTimeZone(tz: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

// YYYY-MM-DD in the given time zone.
export function localDate(tz: string, at = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
}

export function yearOf(day: string) {
  return Number(day.slice(0, 4));
}

// "Mar 4"
export function shortDate(month: number, day: number) {
  return `${MONTHS[month - 1].slice(0, 3)} ${day}`;
}

// "March 4", or "March 4, 1990" with the year.
export function longDate(month: number, day: number, year?: number | null) {
  return `${MONTHS[month - 1]} ${day}${year ? `, ${year}` : ""}`;
}

// "Mar 4" from a YYYY-MM-DD day (which may be Feb 28 standing in for Feb 29).
export function shortDay(day: string) {
  return shortDate(Number(day.slice(5, 7)), Number(day.slice(8, 10)));
}

// The weekday of a YYYY-MM-DD day: "Tuesday".
export function weekday(day: string) {
  return new Intl.DateTimeFormat("en", { weekday: "long", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`));
}

export function daysUntilLabel(days: number) {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export function daysSinceLabel(days: number) {
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}
