import type { TravelOnceResponse } from "@/api/types.gen";
import {
  calculateRelativeMinutes,
  formatRelativeTime,
} from "@/domains/route-search/RouteOverviewPage/utils";
import type { RouteOption } from "@/domains/route-search/SearchResultPage/types";
import { calculateDurationStr } from "@/lib/utils";

/**
 * Convert a single TravelOnceResponse to RouteOption format for RouteDetailPage
 * This creates a simplified route representation with just origin and destination
 * @param travel - The travel data from the API
 * @param originStopName - Name of the origin stop
 * @param destinationStopName - Name of the destination stop
 * @returns RouteOption object for display
 */
export function convertRouteSearchToRouteDetail(
  travel: TravelOnceResponse,
  originStopName: string,
  destinationStopName: string
): RouteOption {
  // Calculate relative time until departure
  const relativeMinutes = calculateRelativeMinutes(travel.departure_datetime);
  const relativeTimeText = formatRelativeTime(relativeMinutes);

  return {
    id: travel.trip_id,
    name: `${originStopName} → ${destinationStopName}`,
    departureTime: travel.departure_time,
    arrivalTime: travel.arrival_time,
    duration: calculateDurationStr(travel.departure_time, travel.arrival_time),
    transferCount: 0, // Direct route for now
    fare: travel.fare,
    totalCost: travel.fare,
    relativeTimeUntilDeparture: relativeTimeText,
    stations: [
      {
        stationName: originStopName,
        departureTime: travel.departure_time,
        departureDatetime: new Date(travel.departure_datetime),
      },
      {
        stationName: destinationStopName,
        arrivalTime: travel.arrival_time,
        arrivalDatetime: new Date(travel.arrival_datetime),
        cost: travel.fare,
      },
    ],
  };
}
