import { BottomNavigation } from "@/components/common/BottomNavigation/BottomNavigation";
import { JourneyTimeline } from "@/components/common/JourneyTimeline/JourneyTimeline";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { TopNavigation } from "@/components/common/TopNavigation/TopNavigation";

import { RouteOverview } from "./internal/RouteOverview";
import { RouteTabs } from "./internal/RouteTabs";
import { SearchConditionsSummary } from "./internal/SearchConditionsSummary";
import { TripSummary } from "./internal/TripSummary";
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
    <div className="bg-white min-h-screen w-full max-w-[var(--max-w-mobile)] mx-auto flex flex-col relative pb-[var(--size-container-md)]">
      <TopNavigation title="検索結果" showBackButton={true} onBack={onBack} />

      <div className="flex-1 flex flex-col overflow-hidden">
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

            <div className="flex-1 px-[var(--size-spacing-lg)] py-[var(--size-spacing-md)] min-h-0 overflow-auto">
              <JourneyTimeline
                title="経路詳細"
                stops={journeyStops}
                renderRightContent={(stop) => (
                  <>
                    {showCosts && stop.cost !== undefined && stop.cost > 0 && (
                      <div className="flex items-center justify-center">
                        <span className="flex items-baseline gap-1">
                          <span className="text-[1.375rem]">{stop.cost}</span>
                          <span className="text-[0.875rem]">円</span>
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col items-end gap-[var(--size-spacing-xs)] flex-0">
                      {(stop.arrivalTime || stop.time) && (
                        <div className="flex flex-0 whitespace-nowrap items-end">
                          <span className="text-[1rem] whitespace-nowrap">
                            {stop.arrivalTime || stop.time} 着
                          </span>
                        </div>
                      )}
                      {stop.departureTime && (
                        <div className="flex flex-0 whitespace-nowrap items-end">
                          <span className="text-[1rem] whitespace-nowrap">
                            {stop.departureTime} 発
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              />
            </div>
          </>
        )}
      </div>

      <BottomNavigation activeTab="route" onTabClick={handleBottomNavClick} />
    </div>
  );
}
