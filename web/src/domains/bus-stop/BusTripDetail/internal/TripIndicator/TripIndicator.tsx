import { MapPin } from "lucide-react";

import React from "react";

import { StretchableIcon } from "@/components/common";
import { useRouteColor } from "@/hooks";

import styles from "./TripIndicator.module.css";

export interface TripIndicatorProps {
  /** Route number (e.g., "001") */
  routeNumber: string;
  /** Route name (e.g., "都心循環線") */
  routeName: string;
  /** Destination name (e.g., "東駅") */
  destinationName: string;
  /** Arrival time in minutes */
  arrivalMinutes: number;
  /** Arrival time as HH:MM string */
  arrivalTime: string;
  /** Number of stops away */
  stopsAway: number;
  /** Text used for color generation (typically route_name or route_id) */
  routeColorText?: string;
}

/**
 * TripIndicator displays route information and arrival details for a bus trip.
 * Used at the top of the BusTripDetail component.
 */
export const TripIndicator: React.FC<TripIndicatorProps> = ({
  routeNumber,
  routeName,
  destinationName,
  arrivalMinutes,
  arrivalTime,
  stopsAway,
  routeColorText,
}) => {
  const { backgroundColor, textColor } = useRouteColor(routeColorText);

  return (
    <div className={styles.tripIndicatorWrapper}>
      <div className={styles.busFront}>
        {/* bus-container-front icon is custom and cannot be replaced with Lucide */}
        <StretchableIcon
          name="bus-container-front"
          className={styles.busFrontSvg}
        />
      </div>
      <div className={styles.tripIndicatorContainer}>
        <div
          className={styles.routeNumber}
          style={{ backgroundColor, color: textColor }}
        >
          {routeNumber}
        </div>
        <div className={styles.routeDetails}>
          <div className={styles.routeInfoRow}>
            {routeNumber !== routeName && (
              <span className={styles.routeName}>{routeName}</span>
            )}
            <MapPin
              size={16}
              className={styles.locationIcon}
              aria-hidden="true"
            />
            <span className={styles.destinationName}>{destinationName}行</span>
          </div>
        </div>
        <div className={styles.arrivalInfo}>
          <div className={styles.arrivalSection}>
            <span className={styles.arrivalLabel}>到着予定</span>
            <span className={styles.arrivalMinutes}>{arrivalMinutes}</span>
            <span className={styles.arrivalUnit}>分後</span>
            <span className={styles.arrivalTime}>({arrivalTime})</span>
          </div>
          <p className={styles.stopsAway}>
            {stopsAway === 0 ? "まもなく到着" : `${stopsAway}駅先に到着`}
          </p>
        </div>
      </div>
    </div>
  );
};
