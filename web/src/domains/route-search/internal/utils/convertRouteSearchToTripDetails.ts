import type { TravelOnceResponse } from "@/api/types.gen";
import type {
  RouteOption,
  Station,
  TripDetails,
} from "@/domains/route-search/SearchResultPage/types";
import { calculateDurationStr } from "@/lib/utils";
import type { RouteSearchResult } from "@/types";

/**
 * Build a single route option from all travel segments.
 *
 * The timed_search API returns an array of travel segments representing
 * a single route that may involve transfers. All segments together form
 * one complete journey from origin to destination.
 *
 * @param travels Array of travel segments from the API
 * @param originStopName Display name for the origin stop
 * @param destinationStopName Display name for the destination stop
 * @param stopNameResolver Optional function to resolve intermediate stop names
 * @returns A single RouteOption combining all segments
 */
function buildRouteFromTravels(
  travels: TravelOnceResponse[],
  originStopName: string,
  destinationStopName: string,
  stopNameResolver?: (stopId: string) => string
): RouteOption {
  if (travels.length === 0) {
    // Edge case: no travels (should not happen in practice)
    return {
      id: "route-1",
      name: "経路 1",
      departureTime: "",
      arrivalTime: "",
      duration: "",
      transferCount: 0,
      fare: 0,
      totalCost: 0,
      stations: [],
    };
  }

  // Calculate total fare by summing all segment fares
  const totalFare = travels.reduce(
    (sum, travel) => sum + (travel.fare ?? 0),
    0
  );

  // Transfer count = number of bus segments - 1 (walk transfers don't count as "real" transfers)
  // Walk transfers are platform changes at the same station
  const busSegments = travels.filter((t) => !t.is_walk_transfer);
  const transferCount = Math.max(0, busSegments.length - 1);

  // Overall departure is from the first segment, arrival is from the last segment
  const firstTravel = travels[0];
  const lastTravel = travels[travels.length - 1];

  // Build stations list including all intermediate stops
  const stations: Station[] = [];

  // Helper to resolve stop name - use provided name for origin/destination,
  // otherwise try resolver or fall back to stop ID
  const resolveStopName = (
    stopId: string,
    isOrigin: boolean,
    isDestination: boolean
  ): string => {
    if (isOrigin) return originStopName;
    if (isDestination) return destinationStopName;
    if (stopNameResolver) return stopNameResolver(stopId);
    return `バス停 ${stopId}`;
  };

  travels.forEach((travel, index) => {
    const isFirstSegment = index === 0;
    const isLastSegment = index === travels.length - 1;
    const nextTravel = travels[index + 1];

    if (isFirstSegment) {
      // Add origin station
      stations.push({
        stationName: resolveStopName(travel.from_stop_id, true, false),
        departureTime: travel.departure_time,
        departureDatetime: new Date(travel.departure_datetime),
      });
    }

    // Add destination of this segment
    // For intermediate stops (transfers), mark them as transfer points
    const isTransferPoint = !isLastSegment;

    // Check if the next segment is a walk transfer
    const nextIsWalkTransfer = nextTravel?.is_walk_transfer === true;

    stations.push({
      stationName: resolveStopName(travel.to_stop_id, false, isLastSegment),
      arrivalTime: travel.arrival_time,
      arrivalDatetime: new Date(travel.arrival_datetime),
      // For transfer points, also add departure time of next segment
      ...(isTransferPoint && nextTravel
        ? {
            departureTime: nextTravel.departure_time,
            departureDatetime: new Date(nextTravel.departure_datetime),
            isTransfer: true,
            // Mark walk transfers
            // TODO: Fetch platform_code from API via GET /stops/{to_stop_id}
            // For now, display without platform number (still shows station name)
            ...(nextIsWalkTransfer
              ? {
                  isWalkTransfer: true,
                }
              : {}),
          }
        : {}),
      // Show cumulative cost at each stop (fare for this segment)
      cost: travel.fare,
    });
  });

  return {
    id: "route-1",
    name: "経路 1",
    departureTime: firstTravel.departure_time,
    arrivalTime: lastTravel.arrival_time,
    duration: calculateDurationStr(
      firstTravel.departure_time,
      lastTravel.arrival_time
    ),
    transferCount,
    fare: totalFare,
    totalCost: totalFare,
    stations,
  };
}

/**
 * Convert RouteSearchResult to TripDetails for the SearchResultPage
 *
 * The API returns all travel segments for a single route. These segments
 * represent the complete journey including any transfers. This function
 * combines them into a single route option with the correct total fare.
 *
 * NOTE: stations の最初の要素・最後の要素 (始点・終点)は arrivalDateTime / departureDateTime 共に同じ時間になる
 */
export function convertRouteSearchToTripDetails(
  result: RouteSearchResult
): TripDetails {
  // Build a single route from all travel segments
  const route = buildRouteFromTravels(
    result.travels,
    result.originStopName,
    result.destinationStopName
  );

  // Only include the route if we have travels
  const routes: RouteOption[] = result.travels.length > 0 ? [route] : [];

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
