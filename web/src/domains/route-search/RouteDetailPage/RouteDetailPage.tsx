import { useCallback, useMemo } from "react";

import { BottomNavigation } from "@/components/common/BottomNavigation/BottomNavigation";
import { JourneyTimeline } from "@/components/common/JourneyTimeline/JourneyTimeline";
import { TopNavigation } from "@/components/common/TopNavigation/TopNavigation";
import { useTimeDisplay } from "@/hooks";

import type { Station } from "../SearchResultPage/types";
import { TripSummary } from "../internal/components";
import styles from "./RouteDetailPage.module.css";
import type { RouteDetailPageProps } from "./types";

/**
 * Route detail page showing journey information for a selected route.
 * Displays departure/arrival times, stations, and costs in a timeline format.
 * Replaces the old SearchResultPage with tab selection - now focused on showing
 * a single pre-selected route from the RouteOverviewPage.
 */
export function RouteDetailPage({
  route,
  fromStation,
  toStation,
  onBack,
  onNavigateToBusStop,
  onNavigateToRecent,
  showCosts = true,
}: RouteDetailPageProps) {
  const timeDisplay = useTimeDisplay();

  // Convert route stations to journey stops format
  const journeyStops = useMemo(
    () =>
      route.stations.map((station: Station, index: number) => ({
        id: `${station.stationName}-${index}`,
        name: station.stationName,
        type:
          index === 0
            ? ("origin" as const)
            : index === route.stations.length - 1
              ? ("destination" as const)
              : ("intermediate" as const),
        arrivalTime: station.arrivalTime,
        departureTime: station.departureTime,
        arrivalDatetime: station.arrivalDatetime,
        departureDatetime: station.departureDatetime,
        cost: station.cost,
      })),
    [route.stations]
  );

  const handleBottomNavClick = useCallback(
    (tab: "bus-stop" | "route" | "recent") => {
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
    },
    [onNavigateToBusStop, onNavigateToRecent]
  );

  return (
    <div className={styles.page}>
      <TopNavigation
        title={`${fromStation} → ${toStation}`}
        showBackButton={true}
        onBack={onBack}
      />

      <div className={styles.scrollArea}>
        <div className={styles.content}>
          <TripSummary route={route} />

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
        </div>
      </div>

      <BottomNavigation activeTab="route" onTabClick={handleBottomNavClick} />
    </div>
  );
}
