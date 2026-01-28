import { useMemo } from "react";

import { BottomNavigation } from "@/components/common/BottomNavigation/BottomNavigation";
import { TopNavigation } from "@/components/common/TopNavigation/TopNavigation";
import { useBottomNavigation } from "@/hooks";
import { calculateDurationMinutes } from "@/lib/utils";

import styles from "./RouteOverviewPage.module.css";
import { RouteOptionCard, SearchSummary } from "./internal";
import type { RouteOverviewPageProps } from "./types";

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
  const handleBottomNavClick = useBottomNavigation("route", {
    onNavigateToBusStop,
    onNavigateToRecent,
  });

  // Calculate durations once for all routes to avoid redundant calculations
  const routesWithDurations = useMemo(
    () =>
      routeData.routes.map((route) => ({
        route,
        durationMinutes: calculateDurationMinutes(
          route.departureTime,
          route.arrivalTime
        ),
      })),
    [routeData.routes]
  );

  // Calculate min/max from pre-calculated durations
  // Guard against empty array: Math.max/min on empty spread returns -Infinity/Infinity
  const durations = routesWithDurations.map((r) => r.durationMinutes);
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
  const minDuration = durations.length > 0 ? Math.min(...durations) : 0;

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
              {routesWithDurations.map(({ route, durationMinutes }) => {
                // Single route or all same duration: show full progress bar (100%)
                // Multiple routes: scale between 50-100% based on relative duration
                const durationRange = maxDuration - minDuration;
                const progressPercentage =
                  routesWithDurations.length <= 1 || durationRange === 0
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
