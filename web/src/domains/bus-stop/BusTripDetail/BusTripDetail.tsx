import { Icon } from "@/components/common/Icon/Icon";

import styles from "./BusTripDetail.module.css";
import type { Stop } from "./internal/StopItem";
import { StopsList } from "./internal/StopsList";
import { TripIndicator } from "./internal/TripIndicator";

export interface BusTripDetailProps {
  stopName: string;
  routeNumber: string;
  routeName: string;
  destinationName: string;
  arrivalMinutes: number;
  arrivalTime: string;
  stopsAway: number;
  stops: Stop[];
  onBack?: () => void;
}

export function BusTripDetail({
  stopName,
  routeNumber,
  routeName,
  destinationName,
  arrivalMinutes,
  arrivalTime,
  stopsAway,
  stops,
  onBack,
}: BusTripDetailProps) {
  return (
    <div className={styles.container}>
      {/* Bus Stop Header */}
      <div className={styles.busStopHeader}>
        <div className={styles.busStopHeaderContent}>
          <button
            onClick={onBack}
            className={styles.backButton}
            aria-label="戻る"
          >
            <Icon name="chevron-left" className="w-6 h-6" aria-hidden="true" />
          </button>
          <h2 className={styles.stopName}>{stopName}</h2>
        </div>
        <div className={styles.divider} />
      </div>

      {/* Trip Indicator */}
      <div className={styles.tripIndicator}>
        <TripIndicator
          routeNumber={routeNumber}
          routeName={routeName}
          destinationName={destinationName}
          arrivalMinutes={arrivalMinutes}
          arrivalTime={arrivalTime}
          stopsAway={stopsAway}
        />
      </div>

      {/* Stops List */}
      <div className={styles.stopsContainer}>
        <h3 className={styles.stopsTitle}>このバスの行き先</h3>
        <div className={styles.stopsScrollArea}>
          <StopsList stops={stops} />
        </div>
      </div>
    </div>
  );
}
