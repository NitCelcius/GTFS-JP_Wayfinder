import { ChevronRight } from "@/components/common/icons";

import styles from "./SlimTripIndicator.module.css";

interface SlimTripIndicatorProps {
  tripId: string;
  routeNumber: string;
  routeName: string;
  destination: string;
  destinationLabel?: string;
  timeDisplay: string;
  timeSubtext: string;
  isPast?: boolean;
  onClick?: () => void;
}

export function SlimTripIndicator({
  tripId,
  routeNumber,
  routeName,
  destination,
  destinationLabel = "行",
  timeDisplay,
  timeSubtext,
  isPast = false,
  onClick,
}: SlimTripIndicatorProps) {
  return (
    <div
      className={`${styles.container} ${isPast ? styles.past : ""}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.();
        }
      }}
      data-trip-id={tripId}
    >
      <div className={styles.routeNumberBadge}>{routeNumber}</div>
      <div className={styles.content}>
        <p className={styles.firstLine}>
          <span className={styles.routeName}>{routeName}</span>
        </p>
        <p className={styles.destinationLine}>
          <span className={styles.destination}>{destination}</span>
          <span className={styles.destinationLabel}>{destinationLabel}</span>
        </p>
        <p className={styles.secondLine}>
          <span className={styles.timeDisplay}>{timeDisplay}</span>
          <span className={styles.timeSubtext}>{timeSubtext}</span>
        </p>
      </div>
      <div className={styles.chevron}>
        <ChevronRight />
      </div>
    </div>
  );
}
