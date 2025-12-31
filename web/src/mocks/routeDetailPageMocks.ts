import type { RouteOption } from "@/domains/route-search/SearchResultPage/types";
import { convertRouteSearchToRouteDetail } from "@/domains/route-search/internal/utils/convertRouteSearchToRouteDetail";

import { mockTravelOnceResponses } from "./routeSearchMocks";

/**
 * Creates a RouteOption mock for RouteDetailPage
 */
export function createMockRoute(): RouteOption {
  return convertRouteSearchToRouteDetail(
    mockTravelOnceResponses[0],
    "東駅",
    "大学病院"
  );
}
