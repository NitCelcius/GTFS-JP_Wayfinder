import type { TripDetails } from "@/domains/route-search/SearchResultPage/types";
import { convertRouteSearchToTripDetails } from "@/domains/route-search/internal/utils/convertRouteSearchToTripDetails";

import {
  mockSingleRouteSearchResult,
  mockTravelOnceResponses,
} from "./routeSearchMocks";

/**
 * Creates a TripDetails mock with the specified number of routes
 * Uses the existing mock data from routeSearchMocks.ts for consistency
 *
 * NOTE: Since convertRouteSearchToTripDetails always creates a single route from travels,
 * this function manually constructs multiple RouteOption objects when routeCount > 1
 */
export function createMockTripDetails(routeCount: number): TripDetails {
  if (routeCount <= 0) {
    throw new Error("routeCount must be at least 1");
  }

  if (routeCount === 1) {
    // Use converter for single route
    return convertRouteSearchToTripDetails(mockSingleRouteSearchResult);
  }

  // For multiple routes, manually create RouteOption objects
  // Each travel represents an alternative route option
  const routes = mockTravelOnceResponses
    .slice(0, routeCount)
    .map((travel, index) => {
      const routeNumber = index + 1;
      return {
        id: `route-${routeNumber}`,
        name: `経路 ${routeNumber}`,
        departureTime: travel.departure_time,
        arrivalTime: travel.arrival_time,
        duration: calculateDuration(travel.departure_time, travel.arrival_time),
        transferCount: 0, // Single segment, no transfers
        fare: travel.fare ?? 0,
        totalCost: travel.fare ?? 0,
        stations: [
          {
            stationName: "東駅",
            departureTime: travel.departure_time,
            departureDatetime: new Date(travel.departure_datetime),
          },
          {
            stationName: "大学病院",
            arrivalTime: travel.arrival_time,
            arrivalDatetime: new Date(travel.arrival_datetime),
            cost: travel.fare,
          },
        ],
      };
    });

  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const searchDateTime = `${dateStr}T08:00`;

  return {
    fromStation: "東駅",
    toStation: "大学病院",
    searchDateTime,
    selectedRouteId: routes[0].id,
    routes,
  };
}

/**
 * Helper to calculate duration string from time strings
 */
function calculateDuration(departure: string, arrival: string): string {
  const [depH, depM] = departure.split(":").map(Number);
  const [arrH, arrM] = arrival.split(":").map(Number);
  const depMinutes = depH * 60 + depM;
  const arrMinutes = arrH * 60 + arrM;
  const durationMinutes = arrMinutes - depMinutes;
  return `${durationMinutes}分`;
}

/**
 * Pre-created TripDetails for single route (no tabs displayed)
 */
export const mockSingleRouteTripDetails: TripDetails =
  convertRouteSearchToTripDetails(mockSingleRouteSearchResult);

/**
 * Pre-created TripDetails for two routes (tabs displayed)
 */
export const mockTwoRoutesTripDetails: TripDetails = createMockTripDetails(2);
