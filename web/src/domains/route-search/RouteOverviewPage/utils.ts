import { DefaultTimeFormatter } from "@/hooks/TimeFormatterBase";
import { calculateDurationJapanese, trimTimeSeconds } from "@/lib/utils";
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
 * Build a single RouteOption from all travel segments.
 *
 * The timed_search API returns an array of travel segments representing
 * a single journey that may involve walk transfers between platforms.
 * All segments together form one complete journey from origin to destination.
 *
 * @param travels Array of travel segments from the API
 * @param originStopName Display name for the origin stop
 * @param destinationStopName Display name for the destination stop
 * @param routeIndex Index for generating unique route ID (default: 0)
 * @returns A single RouteOption combining all segments, or null if no travels
 */
function buildRouteFromTravels(
  travels: RouteSearchResult["travels"],
  originStopName: string,
  destinationStopName: string,
  routeIndex: number = 0 // TODO: handle multiple routes in future
): RouteOption | null {
  if (travels.length === 0) {
    return null;
  }

  // Filter out walk transfers to get only bus segments
  const busSegments = travels.filter((t) => !t.is_walk_transfer);

  // Special case: if there are no bus segments (only walk transfers),
  // it means origin and destination are the same stop with different platforms
  // Return null to indicate this should be handled specially by the UI
  if (busSegments.length === 0) {
    return null;
  }

  // Use the first bus segment's trip_id as the route identifier
  const primaryTripId = busSegments[0].trip_id;

  // Overall journey: departure from first segment, arrival from last segment
  const firstTravel = travels[0];
  const lastTravel = travels[travels.length - 1];

  // Total fare is sum of all segment fares
  const totalFare = travels.reduce(
    (sum, travel) => sum + (travel.fare ?? 0),
    0
  );

  // Transfer count = number of buses needed - 1
  // This represents how many times you need to change buses.
  // Walk transfers between platforms (same-name stops) don't count as transfers.
  // Example: If you take bus A then bus B, that's 2 buses = 1 transfer.
  const transferCount = Math.max(0, busSegments.length - 1);

  const relativeMinutes = calculateRelativeMinutes(
    firstTravel.departure_datetime
  );
  const relativeTimeText = formatRelativeTime(relativeMinutes);

  return {
    id: `route-${routeIndex + 1}`,
    departureTime: trimTimeSeconds(firstTravel.departure_time),
    arrivalTime: trimTimeSeconds(lastTravel.arrival_time),
    duration: calculateDurationJapanese(
      firstTravel.departure_time,
      lastTravel.arrival_time
    ),
    fare: totalFare,
    transfers: transferCount,
    tripId: primaryTripId,
    originStation: originStopName,
    destinationStation: destinationStopName,
    relativeTimeUntilDeparture: relativeTimeText,
  };
}

/**
 * Convert RouteSearchResult from API to RouteOverviewData for UI
 *
 * The API returns all travel segments for a single journey. These segments
 * represent the complete route including any walk transfers between platforms.
 * This function combines them into a single route option with the correct
 * total fare and overall departure/arrival times.
 *
 * @param result - Raw route search result from the API
 * @returns Formatted route overview data ready for UI display
 */
export function convertToRouteOverviewData(
  result: RouteSearchResult
): RouteOverviewData {
  const route = buildRouteFromTravels(
    result.travels,
    result.originStopName,
    result.destinationStopName
  );

  // Only include the route if we have travels
  const routes: RouteOption[] = route ? [route] : [];

  return {
    fromStation: result.originStopName,
    toStation: result.destinationStopName,
    searchDateTime: result.searchTime || "指定なし",
    routes,
  };
}
