import type { TripDetails } from "@/domains/route-search/SearchResultPage/types";
import { convertRouteSearchToTripDetails } from "@/domains/route-search/internal/utils/convertRouteSearchToTripDetails";
import type { RouteSearchResult } from "@/types";

import {
  mockSingleRouteSearchResult,
  mockTravelOnceResponses,
} from "./routeSearchMocks";

/**
 * Creates a TripDetails mock with the specified number of routes
 * Uses the existing mock data from routeSearchMocks.ts for consistency
 */
export function createMockTripDetails(routeCount: number): TripDetails {
  if (routeCount <= 0) {
    throw new Error("routeCount must be at least 1");
  }

  // Use existing mock data up to the available count
  const availableTravels = mockTravelOnceResponses.slice(0, routeCount);

  const mockResult: RouteSearchResult = {
    travels: availableTravels,
    originStopName: "東駅",
    destinationStopName: "大学病院",
    searchTime: "08:00",
  };

  return convertRouteSearchToTripDetails(mockResult);
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
