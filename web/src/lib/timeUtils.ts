/**
 * Timezone-aware time utilities for GTFS-JP Wayfinder.
 *
 * The GTFS data is in JST (Asia/Tokyo, UTC+9). When the server-side code
 * (e.g. Vercel serverless functions running in UTC) calculates begin_time
 * for API requests, it must use JST — not the server's local timezone.
 */

const JST_TIMEZONE = "Asia/Tokyo";

/**
 * Get the current time in JST as an HH:MM:SS string.
 *
 * This is critical for SSR on Vercel (or any non-JST server) where
 * `new Date().toTimeString()` returns UTC time. Using UTC time as
 * `begin_time` for the API would filter buses against the wrong time,
 * potentially returning zero results.
 *
 * @param date - The Date object to format (defaults to now)
 * @returns Time string in "HH:MM:SS" format, in JST
 */
export function getJSTTimeString(date: Date = new Date()): string {
  return date.toLocaleTimeString("en-GB", {
    timeZone: JST_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/**
 * Get a Date-like offset in JST for "minutes ago" calculations.
 *
 * Returns the HH:MM:SS string representing `minutesAgo` minutes before
 * the current time, expressed in JST.
 *
 * @param minutesAgo - Number of minutes to subtract
 * @returns Time string in "HH:MM:SS" format, in JST
 */
export function getJSTTimeStringMinutesAgo(minutesAgo: number): string {
  const now = new Date();
  const past = new Date(now.getTime() - minutesAgo * 60 * 1000);
  return getJSTTimeString(past);
}
