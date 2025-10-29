import { BottomNavigation } from "@/components/common/BottomNavigation/BottomNavigation";
import { JourneyTimeline } from "@/components/common/JourneyTimeline/JourneyTimeline";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { TopNavigation } from "@/components/common/TopNavigation/TopNavigation";
import { useTimeDisplay } from "@/hooks";

import styles from "./SearchResultPage.module.css";
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
  const timeDisplay = useTimeDisplay();

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
    arrivalDatetime: station.arrivalDatetime,
    departureDatetime: station.departureDatetime,
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
    <div className={styles.page}>
      <TopNavigation title="検索結果" showBackButton={true} onBack={onBack} />

      <div className={styles.scrollArea}>
        <RouteOverview
          fromStation={tripDetails.fromStation}
          toStation={tripDetails.toStation}
        />

        <SearchConditionsSummary departureTime={tripDetails.searchDateTime} />

        {isLoading ? (
          <div className={styles.loadingOuter}>
            <div className={styles.loadingInner}>
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

            <div className={styles.timelineWrapper}>
              <JourneyTimeline
                title="経路詳細"
                stops={journeyStops}
                renderRightContent={(stop) => (
                  <>
                    {showCosts && stop.cost !== undefined && stop.cost > 0 && (
                      <div className={styles.costWrapper}>
                        <span className={styles.costInline}>
                          <span className={styles.costValue}>{stop.cost}</span>
                          <span className={styles.yen}>円</span>
                        </span>
                      </div>
                    )}
                    <div className={styles.timeCol}>
                      {stop.arrivalTime && (
                        <div className={styles.timeLine}>
                          <span className={styles.timeText}>
                            {stop.arrivalDatetime
                              ? timeDisplay.format(
                                  stop.arrivalDatetime,
                                  stop.arrivalTime
                                )
                              : stop.arrivalTime}{" "}
                            着
                          </span>
                        </div>
                      )}
                      {stop.departureTime && (
                        <div className={styles.timeLine}>
                          <span className={styles.timeText}>
                            {stop.departureDatetime
                              ? timeDisplay.format(
                                  stop.departureDatetime,
                                  stop.departureTime
                                )
                              : stop.departureTime}{" "}
                            発
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
