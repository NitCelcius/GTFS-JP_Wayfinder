import type { TimedTravelResponse, TravelOnceResponse } from "@/api/types.gen";
import type {
  RouteOption,
  TripDetails,
} from "@/domains/route-search/SearchResultPage/types";

export interface BusStopSearchResult {
  stop_name: string;
  candidate_stop_id_list: string[];
}

export interface RouteSearchData {
  origin: {
    name: string;
    candidateStopIds: string[];
  };
  destination: {
    name: string;
    candidateStopIds: string[];
  };
}

export interface RouteSearchResult {
  travels: TravelOnceResponse[];
  originStopName: string;
  destinationStopName: string;
  searchTime?: string;
}

export interface RouteSearchState {
  isLoading: boolean;
  result: RouteSearchResult | null;
  error: string | null;
}

// Helper function to calculate duration between two time strings
function calculateDuration(departureTime: string, arrivalTime: string): string {
  try {
    const [depHour, depMin] = departureTime.split(":").map(Number);
    const [arrHour, arrMin] = arrivalTime.split(":").map(Number);

    const depTotalMin = depHour * 60 + depMin;
    const arrTotalMin = arrHour * 60 + arrMin;

    let diffMin = arrTotalMin - depTotalMin;

    // Handle next day arrival
    if (diffMin < 0) {
      diffMin += 24 * 60;
    }

    return `${diffMin}分`;
  } catch {
    return "不明";
  }
}

// Converters for API types to domain types
export function convertTimedTravelToRouteResult(
  apiResponse: TimedTravelResponse,
  originStopName: string,
  destinationStopName: string,
  searchTime?: string
): RouteSearchResult {
  return {
    travels: apiResponse.travels,
    originStopName,
    destinationStopName,
    searchTime,
  };
}

// Convert RouteSearchResult to TripDetails for the SearchResultPage
export function convertRouteSearchToTripDetails(
  result: RouteSearchResult
): TripDetails {
  const routes: RouteOption[] = result.travels.map((travel, index) => ({
    id: `route-${index + 1}`,
    name: `経路 ${index + 1}`,
    departureTime: travel.departure_time,
    arrivalTime: travel.arrival_time,
    duration: calculateDuration(travel.departure_time, travel.arrival_time),
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

  return {
    fromStation: result.originStopName,
    toStation: result.destinationStopName,
    searchDateTime: result.searchTime
      ? `${new Date().toISOString().split("T")[0]}T${result.searchTime}`
      : new Date().toISOString(),
    selectedRouteId: routes.length > 0 ? routes[0].id : "route-1",
    routes,
  };
}
