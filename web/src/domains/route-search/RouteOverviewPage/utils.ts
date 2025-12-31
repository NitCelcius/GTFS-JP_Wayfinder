import { DefaultTimeFormatter } from "@/hooks/TimeFormatterBase";
import { calculateDurationJapanese } from "@/lib/utils";
import type { RouteSearchResult } from "@/types";

import type { RouteOption, RouteOverviewData } from "./types";

/**
 * Calculate relative time from now to departure (in minutes)
 * Uses full ISO datetime to handle overnight/next-day departures correctly.
 * Positive = future departure, Negative = past departure
 */
export function calculateRelativeMinutes(departureDatetime: string): number {
  const now = new Date();
  const departure = new Date(departureDatetime);

  // Calculate difference in minutes
  const diffMs = departure.getTime() - now.getTime();
  return Math.floor(diffMs / (1000 * 60));
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
    const relativeMinutes = calculateRelativeMinutes(travel.departure_datetime);
    const relativeTimeText = formatRelativeTime(relativeMinutes);

    return {
      id: `route-${index}`,
      departureTime: travel.departure_time,
      arrivalTime: travel.arrival_time,
      duration: calculateDurationJapanese(
        travel.departure_time,
        travel.arrival_time
      ),
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
