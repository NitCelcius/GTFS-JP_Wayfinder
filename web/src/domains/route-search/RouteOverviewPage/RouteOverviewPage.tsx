import { BottomNavigation } from "@/components/common/BottomNavigation/BottomNavigation";
import { TopNavigation } from "@/components/common/TopNavigation/TopNavigation";

import styles from "./RouteOverviewPage.module.css";
import { RouteOptionCard, SearchSummary } from "./internal";
import type { RouteOverviewPageProps } from "./types";
import { calculateDurationMinutes } from "./utils";

// Progress bar visualization constants
// Base width (50%) ensures even the fastest route has visible progress
// Remaining 50% scales proportionally based on relative duration
const PROGRESS_BASE_PERCENTAGE = 50;
const PROGRESS_SCALE_PERCENTAGE = 50;

/**
 * Overview page displaying multiple route options from a search result.
 * Shows route cards with time, duration, fare, and visual comparison of trip lengths.
 * Allows users to select a specific route to view detailed journey information.
 */
export function RouteOverviewPage({
  routeData,
  onRouteSelect,
  onBack,
  onNavigateToBusStop,
  onNavigateToRecent,
}: RouteOverviewPageProps) {
  const handleBottomNavClick = (tab: "bus-stop" | "route" | "recent") => {
    switch (tab) {
      case "bus-stop":
        onNavigateToBusStop?.();
        break;
      case "recent":
        onNavigateToRecent?.();
        break;
      default:
        // Already on route page
        break;
    }
  };

  // Calculate max duration for relative progress bar sizing
  const maxDuration = Math.max(
    ...routeData.routes.map((route) =>
      calculateDurationMinutes(route.departureTime, route.arrivalTime)
    )
  );

  const minDuration = Math.min(
    ...routeData.routes.map((route) =>
      calculateDurationMinutes(route.departureTime, route.arrivalTime)
    )
  );

  return (
    <div className={styles.page}>
      <TopNavigation
        title={`${routeData.fromStation} → ${routeData.toStation}`}
        showBackButton={true}
        onBack={onBack}
      />

      <div className={styles.scrollArea}>
        <div className={styles.content}>
          <SearchSummary searchDateTime={routeData.searchDateTime} />

          <div className={styles.routesSection}>
            <h2 className={styles.sectionTitle}>
              検索結果 ({routeData.routes.length}件)
            </h2>
            <div className={styles.routesList}>
              {routeData.routes.map((route) => {
                const durationMinutes = calculateDurationMinutes(
                  route.departureTime,
                  route.arrivalTime
                );
                const durationRange = maxDuration - minDuration;
                const progressPercentage =
                  durationRange === 0
                    ? 100
                    : PROGRESS_BASE_PERCENTAGE +
                      ((durationMinutes - minDuration) / durationRange) *
                        PROGRESS_SCALE_PERCENTAGE;

                return (
                  <RouteOptionCard
                    key={route.id}
                    relativeTimeUntilDeparture={
                      route.relativeTimeUntilDeparture
                    }
                    departureTime={route.departureTime}
                    arrivalTime={route.arrivalTime}
                    duration={route.duration}
                    fare={route.fare}
                    transfers={route.transfers}
                    progressPercentage={progressPercentage}
                    onClick={() => onRouteSelect(route.tripId)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation activeTab="route" onTabClick={handleBottomNavClick} />
    </div>
  );
}
