import type {
  RouteOption,
  TripDetails,
} from "@/domains/route-search/SearchResultPage/types";
import { calculateDurationStr } from "@/lib/utils";
import type { RouteSearchResult } from "@/types";

/**
 * Convert RouteSearchResult to TripDetails for the SearchResultPage
 */
export function convertRouteSearchToTripDetails(
  result: RouteSearchResult
): TripDetails {
  const routes: RouteOption[] = result.travels.map((travel, index) => ({
    id: `route-${index + 1}`,
    name: `経路 ${index + 1}`,
    departureTime: travel.departure_time,
    arrivalTime: travel.arrival_time,
    duration: calculateDurationStr(travel.departure_time, travel.arrival_time),
    transferCount: 0, // Direct route for now
    fare: travel.fare,
    totalCost: travel.fare,
    stations: [
      {
        stationName: result.originStopName,
        departureTime: travel.departure_time,
      },
      {
        stationName: result.destinationStopName,
        arrivalTime: travel.arrival_time,
        cost: travel.fare,
      },
    ],
  }));

  let searchDateTime: string;
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  if (result.searchTime) {
    searchDateTime = `${dateStr}T${result.searchTime}`;
  } else {
    // Use today's date with the current time in HH:mm:ss format
    const pad = (n: number) => n.toString().padStart(2, "0");
    const hours = pad(today.getHours());
    const minutes = pad(today.getMinutes());
    searchDateTime = `${dateStr}T${hours}:${minutes}`;
  }

  return {
    fromStation: result.originStopName,
    toStation: result.destinationStopName,
    searchDateTime: searchDateTime,
    selectedRouteId: routes.length > 0 ? routes[0].id : "route-1",
    routes,
  };
}
