/**
 * Format minutes until departure in Japanese format
 * Returns:
 * - "今すぐ" for within 1 minute
 * - "N分後" for 1-59 minutes in the future
 * - "N時間後" for 60+ minutes in the future
 * - "N分前" for past times
 *
 * @param minutes - Minutes until departure (positive for future, negative for past)
 * @returns Formatted string
 */
export function formatMinutesUntilDeparture(minutes: number): string {
  const absMinutes = Math.abs(minutes);

  // Within 1 minute - show "今すぐ"
  if (absMinutes < 1) {
    return "今すぐ";
  }

  // Past times - show "N分前"
  if (minutes < 0) {
    return `${Math.floor(absMinutes)}分前`;
  }

  // Future times under 1 hour - show "N分後"
  if (absMinutes < 60) {
    return `${Math.floor(absMinutes)}分後`;
  }

  // Future times 1 hour or more - show "N時間後"
  const hours = Math.floor(absMinutes / 60);
  return `${hours}時間後`;
}
