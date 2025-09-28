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

// Helper function to calculate duration between two time strings, HH:MM format only
function calculateDurationStr(
  departureTime: string,
  arrivalTime: string
): string {
  // Validate input format
  const timeFormatRegex = /^\d{1,2}:\d{2}$/;
  const MAX_HOUR = 47; // may exceed 24 for next day arrivals

  if (!timeFormatRegex.test(departureTime)) {
    throw new Error(
      `Invalid departure time format. Please use HH:MM format. Input: "${departureTime}"`
    );
  }

  if (!timeFormatRegex.test(arrivalTime)) {
    throw new Error(
      `Invalid arrival time format. Please use HH:MM format. Input: "${arrivalTime}"`
    );
  }

  const [depHour, depMin] = departureTime.split(":").map(Number);
  const [arrHour, arrMin] = arrivalTime.split(":").map(Number);

  // Validate time ranges
  if (depHour < 0 || depHour > MAX_HOUR || isNaN(depHour)) {
    throw new Error(
      `Invalid departure hour. Must be between 0-${MAX_HOUR}. Input: "${depHour}"`
    );
  }

  if (depMin < 0 || depMin > 59 || isNaN(depMin)) {
    throw new Error(
      `Invalid departure minutes. Must be between 0-59. Input: "${depMin}"`
    );
  }

  if (arrHour < 0 || arrHour > MAX_HOUR || isNaN(arrHour)) {
    throw new Error(
      `Invalid arrival hour. Must be between 0-${MAX_HOUR}. Input: "${arrHour}"`
    );
  }

  if (arrMin < 0 || arrMin > 59 || isNaN(arrMin)) {
    throw new Error(
      `Invalid arrival minutes. Must be between 0-59. Input: "${arrMin}"`
    );
  }

  const depTotalMin = depHour * 60 + depMin;
  const arrTotalMin = arrHour * 60 + arrMin;

  let diffMin = arrTotalMin - depTotalMin;

  // Handle next day arrival
  if (diffMin < 0) {
    diffMin += 24 * 60;
  }

  return `${diffMin}分`;
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
