import type { TravelOnceResponse } from "@/api/types.gen";
import type { RouteOption } from "@/domains/route-search/SearchResultPage/types";
import { calculateDurationStr, trimTimeSeconds } from "@/lib/utils";

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
  return {
    id: travel.trip_id,
    name: `${originStopName} → ${destinationStopName}`,
    departureTime: trimTimeSeconds(travel.departure_time),
    arrivalTime: trimTimeSeconds(travel.arrival_time),
    duration: calculateDurationStr(travel.departure_time, travel.arrival_time),
    transferCount: 0, // Direct route for now
    fare: travel.fare,
    totalCost: travel.fare,
    stations: [
      {
        stationName: originStopName,
        departureTime: trimTimeSeconds(travel.departure_time),
        departureDatetime: new Date(travel.departure_datetime),
      },
      {
        stationName: destinationStopName,
        arrivalTime: trimTimeSeconds(travel.arrival_time),
        arrivalDatetime: new Date(travel.arrival_datetime),
        cost: travel.fare,
      },
    ],
  };
}
