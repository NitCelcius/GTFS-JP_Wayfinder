// Temporary re-exports to keep imports working during migration
export { RouteSearchPage } from "@/app/components/page/RouteSearchPage/RouteSearchPage";
export { BusStopSearchPage } from "@/app/components/page/BusStopSearchPage/BusStopSearchPage";
export { SearchResultPage } from "@/app/components/page/SearchResultPage/SearchResultPage";
export type { TripDetails } from "@/app/components/page/SearchResultPage/types";
export { RecentPage } from "@/app/components/page/RecentPage/RecentPage";

export { BusStopInfoPage } from "@/components/page/BusStopInfoPage/BusStopInfoPage";

// NOTE: Remove this file after the full migration of all page components into
// web/src/components/page/* and update imports to point directly to those files.
