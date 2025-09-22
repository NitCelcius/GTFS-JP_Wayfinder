import { TopNavigation } from "@/components/common/TopNavigation/TopNavigation";
import { BottomNavigation } from "@/components/common/BottomNavigation/BottomNavigation";
import { JourneyTimeline } from "@/components/common/JourneyTimeline/JourneyTimeline";
import { RouteOverview } from "./internal/RouteOverview";
import { SearchConditionsSummary } from "./internal/SearchConditionsSummary";
import { RouteTabs } from "./internal/RouteTabs";
import { TripSummary } from "./internal/TripSummary";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { SearchResultPageProps } from "./types";

export function SearchResultPage({
  tripDetails,
  onRouteSelect,
  onBack,
  onNavigateToBusStop,
  onNavigateToRecent,
  showCosts = true,
  isLoading = false,
}: SearchResultPageProps) {
  const selectedRoute =
    tripDetails.routes.find(
      (route) => route.id === tripDetails.selectedRouteId
    ) || tripDetails.routes[0];

  const handleRouteChange = (routeIndex: number) => {
    const route = tripDetails.routes[routeIndex];
    if (route && onRouteSelect) {
      onRouteSelect(route.id);
    }
  };

  const selectedRouteIndex = tripDetails.routes.findIndex(
    (route) => route.id === selectedRoute.id
  );

  // Convert route stations to journey stops format
  const journeyStops = selectedRoute.stations.map((station, index) => ({
    id: `${station.stationName}-${index}`,
    name: station.stationName,
    type:
      index === 0
        ? ("origin" as const)
        : index === selectedRoute.stations.length - 1
        ? ("destination" as const)
        : ("intermediate" as const),
    arrivalTime: station.arrivalTime,
    departureTime: station.departureTime,
    cost: station.cost,
  }));

  const handleBottomNavClick = (tab: "bus-stop" | "route" | "recent") => {
    switch (tab) {
      case "bus-stop":
        onNavigateToBusStop?.();
        break;
      case "recent":
        onNavigateToRecent?.();
        break;
      default:
        // Already on route page (results)
        break;
    }
  };

  return (
    <div className="bg-white min-h-screen w-full max-w-[var(--max-w-mobile)] flex flex-col">
      <TopNavigation title="検索結果" showBackButton={true} onBack={onBack} />

      <div className="flex-1 flex flex-col">
        <RouteOverview
          fromStation={tripDetails.fromStation}
          toStation={tripDetails.toStation}
        />

        <SearchConditionsSummary departureTime={tripDetails.searchDateTime} />

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-[var(--size-spacing-4xl)]">
            <div className="flex flex-col items-center gap-[var(--size-spacing-lg)]">
              <LoadingSpinner size="lg" />
              <p className="text-[1rem] text-gray-600">経路を検索中...</p>
            </div>
          </div>
        ) : (
          <>
            <RouteTabs
              routes={tripDetails.routes}
              selectedIndex={selectedRouteIndex}
              onTabChange={handleRouteChange}
            />

            <TripSummary route={selectedRoute} />

            <div className="flex-1 px-[var(--size-spacing-lg)] py-[var(--size-spacing-md)] min-h-0">
              <JourneyTimeline
                title="経路詳細"
                stops={journeyStops}
                variant="search-result"
                showCosts={showCosts}
              />
            </div>
          </>
        )}
      </div>

      <BottomNavigation activeTab="route" onTabClick={handleBottomNavClick} />
    </div>
  );
}
export * from "@/app/components/page/SearchResultPage/SearchResultPage";
export * from "@/app/components/page/SearchResultPage/SearchResultPage";
