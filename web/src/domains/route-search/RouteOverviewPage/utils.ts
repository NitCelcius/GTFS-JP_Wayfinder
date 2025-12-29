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
 * Convert RouteSearchResult from API to RouteOverviewData for UI
 */
export function convertToRouteOverviewData(
  result: RouteSearchResult
): RouteOverviewData {
  const routes: RouteOption[] = result.travels.map((travel, index) => ({
    id: `route-${index}`,
    departureTime: travel.departure_time,
    arrivalTime: travel.arrival_time,
    duration: calculateDuration(travel.departure_time, travel.arrival_time),
    fare: travel.fare,
    tripId: travel.trip_id,
  }));

  return {
    fromStation: result.originStopName,
    toStation: result.destinationStopName,
    searchDateTime: result.searchTime || "指定なし",
    routes,
  };
}
