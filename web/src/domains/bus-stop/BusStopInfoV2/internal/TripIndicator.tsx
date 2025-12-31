import { StretchableIcon } from "@/components/common";
import { ChevronRight } from "@/components/common/icons";
import { useRouteColor } from "@/hooks";

import styles from "./TripIndicator.module.css";

interface TripIndicatorProps {
  tripId: string;
  routeNumber: string;
  routeName: string;
  destination: string;
  destinationLabel?: string;
  timeDisplay: string;
  timeSubtext: string;
  stopsUntilArrival?: string;
  /** Text used for color generation (typically route_name or route_id) */
  routeColorText?: string;
  onClick?: () => void;
}

export function TripIndicator({
  tripId,
  routeNumber,
  routeName,
  destination,
  destinationLabel = "行",
  timeDisplay,
  timeSubtext,
  stopsUntilArrival,
  routeColorText,
  onClick,
}: TripIndicatorProps) {
  const { backgroundColor, textColor } = useRouteColor(routeColorText);

  return (
    <a
      className={styles.container}
      onClick={onClick}
      role="button"
      tabIndex={0}
      data-trip-id={tripId}
    >
      <div className={styles.busIcon}>
        <StretchableIcon
          name="bus-container-front"
          className={styles.busIconImg}
        />
      </div>
      <div className={styles.content}>
        <div className={styles.head}>
          <div
            className={styles.routeNumberBadge}
            style={{ backgroundColor, color: textColor }}
          >
            {routeNumber}
          </div>
          <div className={styles.tripInfo}>
            <div className={styles.routeLabel}>{routeName}</div>
            <p className={styles.destinationLine}>
              <span className={styles.destination}>{destination}</span>
              <span className={styles.destinationLabel}>
                {destinationLabel}
              </span>
            </p>
          </div>
        </div>

        <div className={styles.time}>
          <span className={styles.timeValue}>{timeDisplay}</span>
          <span className={styles.timeSubtext}>{timeSubtext}</span>
        </div>

        <div className={styles.footer}>
          <span className={styles.stopsInfo}>
            {stopsUntilArrival || "情報なし"}
          </span>
          <div className={styles.chevron}>
            <ChevronRight />
          </div>
        </div>
      </div>
    </a>
  );
}
