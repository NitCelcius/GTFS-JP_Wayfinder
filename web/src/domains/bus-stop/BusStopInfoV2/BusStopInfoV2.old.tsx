import { useEffect, useState } from "react";

import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";

import styles from "./BusStopInfoV2.module.css";

export interface BusInfo {
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
  distance: string;
  pastBus?: UpcomingBusInfo | null;
  upcomingBuses: UpcomingBusInfo[];
  isLoading?: boolean;
  error?: string | null;
  onBack?: () => void;
  onRoutineSearch?: () => void;
  onWalkDirections?: () => void;
  onTransfer?: () => void;
  onRouteList?: () => void;
  onBusClick?: (bus: UpcomingBusInfo) => void;
}

interface ChevronIconProps {
  className?: string;
  style?: React.CSSProperties;
}

function ChevronIcon({ className, style }: ChevronIconProps) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function WalkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2" />
      <path d="M12 6v14" />
      <path d="M6 18l-3 3" />
      <path d="M18 18l3 3" />
      <path d="M9 12l-3-3" />
      <path d="M15 12l3-3" />
    </svg>
  );
}

function TransferIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6" />
      <path d="M9 19l-3-3m0 0l3-3" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function BusStopInfoV2({
  busStopName,
  distance,
  pastBus,
  upcomingBuses,
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

  useEffect(() => {
    // Ensure we always have the first bus as the highlighted one (the actual next bus, not past)
    const nonPastBuses = upcomingBuses.filter((b) => !b.isPast);
    setDisplayBuses(nonPastBuses);
  }, [upcomingBuses]);

  if (error && !isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.actionBar}>
          <div className={styles.headerRow}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <button
                className={styles.backButton}
                onClick={onBack}
                aria-label="Go back"
              >
                <ChevronIcon style={{ transform: "rotate(180deg)" }} />
              </button>
              <h1 className={styles.busStopName}>{busStopName}</h1>
            </div>
            <div className={styles.distanceLabel}>{distance}</div>
          </div>
        </div>

        <div className={styles.scrollableContent}>
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>エラーが発生しました</p>
            <p className={styles.errorDetails}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Action Bar */}
      <div className={styles.actionBar}>
        {/* Header Row with back button, name, and distance */}
        <div className={styles.headerRow}>
          <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <button
              className={styles.backButton}
              onClick={onBack}
              aria-label="Go back"
            >
              <ChevronIcon style={{ transform: "rotate(180deg)" }} />
            </button>
            <h1 className={styles.busStopName}>{busStopName}</h1>
          </div>
          <div className={styles.distanceLabel}>{distance}</div>
        </div>

        {/* Action buttons - horizontal scroll */}
        <div className={styles.actionButtons}>
          <button
            className={styles.actionButton}
            onClick={onRoutineSearch}
            aria-label="Search destinations"
          >
            <div className={styles.actionButtonIcon}>
              <SearchIcon />
            </div>
            <span className={styles.actionButtonLabel}>行き先検索</span>
          </button>
          <button
            className={styles.actionButton}
            onClick={onWalkDirections}
            aria-label="Get walk directions"
          >
            <div className={styles.actionButtonIcon}>
              <WalkIcon />
            </div>
            <span className={styles.actionButtonLabel}>徒歩で行く</span>
          </button>
          <button
            className={styles.actionButton}
            onClick={onTransfer}
            aria-label="Transfer options"
          >
            <div className={styles.actionButtonIcon}>
              <TransferIcon />
            </div>
            <span className={styles.actionButtonLabel}>のりば切替</span>
          </button>
          <button
            className={styles.actionButton}
            onClick={onRouteList}
            aria-label="View route list"
          >
            <div className={styles.actionButtonIcon}>
              <MapIcon />
            </div>
            <span className={styles.actionButtonLabel}>路線一覧</span>
          </button>
        </div>

        <div className={styles.divider} />
      </div>

      {/* Scrollable Content */}
      <div className={styles.scrollableContent}>
        {/* Past bus indicator */}
        {pastBus && (
          <div className={styles.pastSection}>
            <div className={styles.pastBusContainer}>
              <div className={styles.routeNumberBadge}>
                {pastBus.routeNumber}
              </div>
              <div className={styles.tripContent}>
                <div className={styles.tripRouteInfo}>
                  <div className={styles.tripRouteName}>
                    {pastBus.routeName}
                  </div>
                  <div>
                    <span className={styles.tripRouteDestination}>
                      {pastBus.destination}
                    </span>
                    <span className={styles.destinationLabel}>
                      {pastBus.destinationLabel || "行"}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.tripTimeInfo}>
                <div>
                  <span className={styles.pastLabel}>
                    {pastBus.minutesUntilDeparture}
                  </span>
                  <span className={styles.timeUnit}>分前</span>
                </div>
                <span className={styles.timeDisplay}>
                  ({pastBus.departureTime})
                </span>
              </div>
              <div className={styles.chevron}>
                <ChevronIcon />
              </div>
            </div>
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

            {/* First bus with full card including bus front SVG */}
            <a
              className={styles.tripCard}
              onClick={() => onBusClick?.(displayBuses[0])}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onBusClick?.(displayBuses[0]);
                }
              }}
            >
              <div className={styles.busFrontWrapper}>
                {/* Bus SVG - you can replace with an actual SVG component */}
                <div
                  style={{
                    width: "40px",
                    height: "80px",
                    backgroundColor: "var(--gray-100)",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  🚌
                </div>
              </div>

              <div className={styles.tripCardContent}>
                <div className={styles.tripCardHead}>
                  <div className={styles.routeNumberBadgePrimary}>
                    {displayBuses[0].cost || displayBuses[0].routeNumber}
                  </div>
                  <div className={styles.tripIndicator}>
                    <div className={styles.routeLabel}>
                      {displayBuses[0].routeName}
                    </div>
                    <div className={styles.destinationWithLabel}>
                      <span className={styles.destination}>
                        {displayBuses[0].destination}
                      </span>
                      <span className={styles.destinationLabelSmall}>
                        {displayBuses[0].destinationLabel || "行"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.tripTime}>
                  <span className={styles.arrivalTime}>
                    {displayBuses[0].minutesUntilDeparture}
                  </span>
                  <span className={styles.arrivalUnit}>分後</span>
                  <span className={styles.arrivalDisplay}>
                    ({displayBuses[0].departureTime})
                  </span>
                </div>

                <div className={styles.tripCardFooter}>
                  <span className={styles.stopsUntilArrival}>
                    {displayBuses[0].stopsUntilArrival || "情報なし"}
                  </span>
                  <div className={styles.chevronEnd}>
                    <ChevronIcon />
                  </div>
                </div>
              </div>
            </a>

            {/* Remaining buses as slim indicators */}
            {displayBuses.slice(1).map((bus, index) => (
              <div
                key={index}
                className={styles.slimTripIndicator}
                role="button"
                tabIndex={0}
                onClick={() => onBusClick?.(bus)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onBusClick?.(bus);
                  }
                }}
              >
                <div className={styles.slimRouteNumber}>
                  {bus.cost || bus.routeNumber}
                </div>
                <div className={styles.slimContent}>
                  <div className={styles.slimRouteName}>{bus.routeName}</div>
                  <div className={styles.slimRouteDestination}>
                    {bus.destination}
                  </div>
                  <span className={styles.slimDestinationLabel}>
                    {bus.destinationLabel || "行"}
                  </span>
                </div>
                <div className={styles.slimTimeInfo}>
                  <span className={styles.slimTimeValue}>
                    {bus.minutesUntilDeparture}
                  </span>
                  <span className={styles.slimTimeUnit}>
                    {bus.minutesUntilDeparture >= 60 ? "時間後" : "分後"}
                  </span>
                  <span className={styles.slimTimeDisplay}>
                    ({bus.departureTime})
                  </span>
                </div>
                <div className={styles.slimChevron}>
                  <ChevronIcon />
                </div>
              </div>
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
