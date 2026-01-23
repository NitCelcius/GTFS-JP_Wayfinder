import { ChevronRight } from "lucide-react";

import { useRouteColor } from "@/hooks";

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
  /** Text used for color generation (typically route_name or route_id) */
  routeColorText?: string;
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
  routeColorText,
  onClick,
}: SlimTripIndicatorProps) {
  const { backgroundColor, textColor } = useRouteColor(routeColorText);

  return (
    <a
      className={`${styles.container} ${isPast ? styles.past : ""}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      data-trip-id={tripId}
    >
      <div
        className={styles.routeNumberBadge}
        style={{ backgroundColor, color: textColor }}
      >
        {routeNumber}
      </div>
      <div className={styles.content}>
        <p className={styles.firstLine}>
          <span className={styles.routeName}>{routeName}</span>
        </p>
        <p className={`${styles.destinationLine} line-clamp-2`}>
          <span className={styles.destination}>{destination}</span>
          <span className={styles.destinationLabel}>{destinationLabel}</span>
        </p>
        <p className={styles.secondLine}>
          <span className={styles.timeDisplay}>{timeDisplay}</span>
          <span className={styles.timeSubtext}>{timeSubtext}</span>
        </p>
      </div>
      <div className={styles.chevron}>
        <ChevronRight size={24} />
      </div>
    </a>
  );
}
