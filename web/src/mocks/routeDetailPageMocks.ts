import type { Route } from "@/domains/route-search/RouteDetailPage/types";
import { convertRouteSearchToRouteDetail } from "@/domains/route-search/internal/utils/convertRouteSearchToRouteDetail";

import { mockTravelOnceResponses } from "./routeSearchMocks";

/**
 * Creates a Route mock for RouteDetailPage
 * Uses the first travel from routeSearchMocks for consistency
 */
export function createMockRoute(): Route {
  return convertRouteSearchToRouteDetail(
    mockTravelOnceResponses[0],
    "東駅",
    "大学病院"
  );
}

/**
 * Pre-created Route for RouteDetailPage stories
 * Note: This is synchronous version for Storybook (which doesn't handle async well)
 */
export const mockRoute: Route = {
  id: "trip-001",
  name: "選択された経路",
  departureTime: "08:00",
  arrivalTime: "08:45",
  duration: "45分",
  transferCount: 0,
  fare: 200,
  totalCost: 200,
  stations: [
    {
      stationName: "東駅",
      departureTime: "08:00",
      departureDatetime: new Date("2024-01-01T08:00:00"),
    },
    {
      stationName: "大学病院",
      arrivalTime: "08:45",
      arrivalDatetime: new Date("2024-01-01T08:45:00"),
      cost: 200,
    },
  ],
};
