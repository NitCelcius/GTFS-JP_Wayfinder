import { DefaultTimeFormatter } from "@/hooks/TimeFormatterBase";
import type { RouteSearchResult } from "@/types";

import type { RouteOption, RouteOverviewData } from "./types";

/**
 * Calculate duration in minutes between two time strings (HH:MM format)
 */
function calculateDuration(startTime: string, endTime: string): string {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  let durationMinutes = endTotalMinutes - startTotalMinutes;

  // Handle overnight trips
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60;
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours > 0) {
    return `${hours}時間${minutes}分`;
  }
  return `${minutes}分`;
}

/**
 * Calculate duration in minutes for progress bar
 */
export function calculateDurationMinutes(
  startTime: string,
  endTime: string
): number {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  let durationMinutes = endTotalMinutes - startTotalMinutes;

  // Handle overnight trips
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60;
  }

  return durationMinutes;
}

/**
 * Calculate relative time from now to departure (in minutes)
 * Positive = future departure, Negative = past departure
 */
export function calculateRelativeTime(departureTime: string): number {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  const [depHours, depMinutes] = departureTime.split(":").map(Number);
  const depTotalMinutes = depHours * 60 + depMinutes;

  let diff = depTotalMinutes - currentTotalMinutes;

  // Handle overnight scenario (if departure is tomorrow)
  if (diff < -720) {
    // If difference is more than 12 hours negative, assume it's tomorrow
    diff += 24 * 60;
  }

  return diff;
}

/**
 * Format relative time message with bus context
 */
export function formatRelativeTime(minutes: number): string {
  const formatter = new DefaultTimeFormatter("ja");
  const seconds = minutes * 60;
  const relativeText = formatter.format(seconds);

  if (minutes > 0) {
    return `${relativeText}にバス停発`;
  } else if (minutes < 0) {
    // For past times, convert "N分前" to "N分前に出発済み"
    return `${relativeText}に出発済み`;
  } else {
    return "まもなく出発";
  }
}

/**
 * Convert RouteSearchResult from API to RouteOverviewData for UI
 * @param result - Raw route search result from the API
 * @returns Formatted route overview data ready for UI display
 */
export function convertToRouteOverviewData(
  result: RouteSearchResult
): RouteOverviewData {
  const routes: RouteOption[] = result.travels.map((travel, index) => {
    const relativeMinutes = calculateRelativeTime(travel.departure_time);
    const relativeTimeText = formatRelativeTime(relativeMinutes);

    return {
      id: `route-${index}`,
      departureTime: travel.departure_time,
      arrivalTime: travel.arrival_time,
      duration: calculateDuration(travel.departure_time, travel.arrival_time),
      fare: travel.fare,
      // Known limitation: Transfer count is currently hardcoded to 0
      // The API response does not yet include information about transfers/connections
      // This should be calculated once the API provides segment/leg data for each route
      transfers: 0,
      tripId: travel.trip_id,
      originStation: result.originStopName,
      destinationStation: result.destinationStopName,
      relativeTimeUntilDeparture: relativeTimeText,
    };
  });

  return {
    fromStation: result.originStopName,
    toStation: result.destinationStopName,
    searchDateTime: result.searchTime || "指定なし",
    routes,
  };
}
