import { BottomNavigation } from "@/components/common/BottomNavigation/BottomNavigation";
import { TopNavigation } from "@/components/common/TopNavigation/TopNavigation";
import { ClockIcon } from "@/components/common/icons/ClockIcon";
import { useSearchHistory } from "@/hooks";

import { RecentBusStopSearches } from "./internal/RecentBusStopSearches";
import { RecentRouteSearches } from "./internal/RecentRouteSearches";

interface RecentPageProps {
  onNavigateToRoute?: () => void;
  onNavigateToBusStop?: () => void;
  onNavigateToBusStopInfo?: (busStopId: string) => void;
  onNavigateToRouteSearch?: (fromStation: string, toStation: string) => void;
}

export function RecentPage({
  onNavigateToRoute,
  onNavigateToBusStop,
  onNavigateToBusStopInfo,
  onNavigateToRouteSearch,
}: RecentPageProps) {
  const { busStopSearches, routeSearches, error } = useSearchHistory();

  const handleBottomNavClick = (tab: "bus-stop" | "route" | "recent") => {
    switch (tab) {
      case "bus-stop":
        onNavigateToBusStop?.();
        break;
      case "route":
        onNavigateToRoute?.();
        break;
      default:
        break;
    }
  };

  const handleBusStopSelect = (busStopId: string) => {
    onNavigateToBusStopInfo?.(busStopId);
  };

  const handleRouteSelect = (fromStation: string, toStation: string) => {
    onNavigateToRouteSearch?.(fromStation, toStation);
  };

  const handleViewMoreBusStops = () =>
    console.log("Navigate to more bus stop search history");
  const handleViewMoreRoutes = () =>
    console.log("Navigate to more route search history");

  if (error) {
    console.error("Search history error:", error);
    // Fall through to render with empty data
  }

  return (
    <div className="w-full max-w-[var(--max-w-mobile)] flex flex-col relative min-h-screen  pb-[var(--size-container-md)]">
      <TopNavigation icon={<ClockIcon />} title="最近" />

      <div className="flex-1 px-[var(--size-spacing-lg)] py-[var(--size-spacing-md)] overflow-y-auto">
        <div className="flex flex-col gap-[var(--size-spacing-2xl)]">
          <RecentBusStopSearches
            recentBusStops={busStopSearches}
            onBusStopSelect={handleBusStopSelect}
            onViewMore={handleViewMoreBusStops}
          />
          <RecentRouteSearches
            recentRoutes={routeSearches}
            onRouteSelect={handleRouteSelect}
            onViewMore={handleViewMoreRoutes}
          />
        </div>
      </div>

      <BottomNavigation activeTab="recent" onTabClick={handleBottomNavClick} />
    </div>
  );
}
