import { useEffect, useRef, useState } from "react";

import { ActionButtonBar } from "@/components/common/ActionButtonBar";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import {
  MapIcon,
  SearchIcon,
  TransferIcon,
  WalkIcon,
} from "@/components/common/icons";

import styles from "./BusStopInfoV2.module.css";
import { BusStopHeader } from "./internal/BusStopHeader";
import { SlimTripIndicator } from "./internal/SlimTripIndicator";
import { TripIndicator } from "./internal/TripIndicator";
import { formatMinutesUntilDeparture } from "./utils/timeFormatter";

export interface BusInfo {
  tripId: string;
  routeNumber: string;
  routeName: string;
  destination: string;
  destinationLabel?: string;
  minutesUntilDeparture: number;
  departureTime: string;
  cost?: number;
  stopsUntilArrival?: string;
}

export interface UpcomingBusInfo extends BusInfo {
  isPast?: boolean;
}

interface BusStopInfoV2Props {
  busStopId?: string;
  busStopName: string;
  distance?: string;
  pastBus?: UpcomingBusInfo | null;
  upcomingBuses: UpcomingBusInfo[];
  platformCode?: string | null;
  isLoading?: boolean;
  error?: string | null;
  onBack?: () => void;
  onRoutineSearch?: () => void;
  onWalkDirections?: () => void;
  onTransfer?: () => void;
  onRouteList?: () => void;
  onBusClick?: (bus: UpcomingBusInfo) => void;
}

export function BusStopInfoV2({
  busStopName,
  distance,
  pastBus,
  upcomingBuses,
  platformCode,
  isLoading = false,
  error = null,
  onBack,
  onRoutineSearch,
  onWalkDirections,
  onTransfer,
  onRouteList,
  onBusClick,
}: BusStopInfoV2Props) {
  const [displayBuses, setDisplayBuses] = useState<UpcomingBusInfo[]>([]);
  const scrollableContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure we always have the first bus as the highlighted one (the actual next bus, not past)
    const nonPastBuses = upcomingBuses.filter((b) => !b.isPast);
    setDisplayBuses(nonPastBuses);
  }, [upcomingBuses]);

  // Scroll to upcoming buses section on mount to hide past bus initially
  useEffect(() => {
    const scrollToUpcoming = () => {
      if (scrollableContentRef.current && displayBuses.length > 0) {
        const upcomingSection = scrollableContentRef.current.querySelector(
          `.${styles.upcomingSection}`
        );
        if (upcomingSection) {
          upcomingSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    };

    // Delay scroll to ensure DOM is ready
    const timer = setTimeout(scrollToUpcoming, 100);
    return () => clearTimeout(timer);
  }, [displayBuses]);

  const actionButtons = [
    {
      icon: <SearchIcon />,
      label: "行き先検索",
      id: "search-destinations",
      onClick: () => onRoutineSearch?.(),
      ariaLabel: "Search destinations",
    },
    {
      icon: <WalkIcon />,
      label: "徒歩で行く",
      id: "show-walk-directions",
      onClick: () => onWalkDirections?.(),
      ariaLabel: "Get walk directions",
    },
    {
      icon: <TransferIcon />,
      label: "のりば切替",
      id: "change-transfer",
      onClick: () => onTransfer?.(),
      ariaLabel: "Transfer options",
    },
    {
      icon: <MapIcon />,
      label: "路線一覧",
      id: "view-route-list",
      onClick: () => onRouteList?.(),
      ariaLabel: "View route list",
    },
  ];

  if (error && !isLoading) {
    return <ErrorBoundary message={error} />;
  }

  return (
    <div className={styles.page}>
      {/* Action Bar */}
      <div className={styles.actionBar}>
        {/* Header Row with back button, name, and distance */}
        <BusStopHeader
          busStopName={busStopName}
          platformCode={platformCode}
          distance={distance}
          onBack={onBack}
        />

        {/* Action buttons - horizontal scroll */}
        <ActionButtonBar buttons={actionButtons} />

        <div className={styles.divider} />
      </div>

      {/* Scrollable Content */}
      <div className={styles.scrollableContent} ref={scrollableContentRef}>
        {/* Past bus indicator */}
        {pastBus && (
          <div className={styles.pastSection}>
            <SlimTripIndicator
              tripId={pastBus.tripId}
              routeNumber={pastBus.routeNumber}
              routeName={pastBus.routeName}
              destination={pastBus.destination}
              destinationLabel={pastBus.destinationLabel}
              timeDisplay={formatMinutesUntilDeparture(
                pastBus.minutesUntilDeparture
              )}
              timeSubtext={`(${pastBus.departureTime})`}
              isPast={true}
              onClick={() => onBusClick?.(pastBus)}
            />
          </div>
        )}

        {/* Upcoming buses section */}
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <LoadingSpinner size="sm" />
            <span>バス情報を読み込み中...</span>
          </div>
        ) : displayBuses.length > 0 ? (
          <div className={styles.upcomingSection}>
            <div className={styles.sectionTitle}>今後のバス</div>
            <div className={styles.sectionDivider} />

            {/* First bus with full card */}
            <TripIndicator
              tripId={displayBuses[0].tripId}
              routeNumber={
                displayBuses[0].cost?.toString() || displayBuses[0].routeNumber
              }
              routeName={displayBuses[0].routeName}
              destination={displayBuses[0].destination}
              destinationLabel={displayBuses[0].destinationLabel}
              timeDisplay={formatMinutesUntilDeparture(
                displayBuses[0].minutesUntilDeparture
              )}
              timeSubtext={`(${displayBuses[0].departureTime})`}
              stopsUntilArrival={displayBuses[0].stopsUntilArrival}
              onClick={() => onBusClick?.(displayBuses[0])}
            />

            {/* Remaining buses as slim indicators */}
            {displayBuses.slice(1).map((bus) => (
              <SlimTripIndicator
                key={bus.tripId}
                tripId={bus.tripId}
                routeNumber={bus.cost?.toString() || bus.routeNumber}
                routeName={bus.routeName}
                destination={bus.destination}
                destinationLabel={bus.destinationLabel}
                timeDisplay={formatMinutesUntilDeparture(
                  bus.minutesUntilDeparture
                )}
                timeSubtext={`(${bus.departureTime})`}
                onClick={() => onBusClick?.(bus)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.loadingContainer}>
            <p>現在運行中のバスがありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
