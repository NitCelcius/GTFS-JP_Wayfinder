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
  /** Number of stops from origin to user's stop (for past buses) */
  stopsAway: number;
  /** Number of stops between current bus location and user's stop (null = bus hasn't departed) */
  stopsUntilArrival?: number | null;
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
  stopsUntilArrival,
  routeColorText,
}) => {
  const { backgroundColor, textColor } = useRouteColor(routeColorText);

  // Determine which message to show based on bus state:
  // - Past bus (arrivalMinutes < 0): Show "X駅先に到着" (traveled X stops from origin)
  // - En-route bus (stopsUntilArrival is number >= 0): Show "X駅前に到着" or "まもなく到着"
  // - Not yet departed (stopsUntilArrival is null): Don't show anything
  const renderStopsAwayMessage = () => {
    if (arrivalMinutes < 0) {
      // Past bus - show how many stops it traveled from origin
      return stopsAway === 0 ? "まもなく到着" : `${stopsAway}駅先に到着`;
    } else if (stopsUntilArrival !== null && stopsUntilArrival !== undefined) {
      // En-route bus - show actual stops until arrival
      return stopsUntilArrival === 0
        ? "まもなく到着"
        : `${stopsUntilArrival}駅前に到着`;
    }
    // Bus hasn't departed yet - don't show anything
    return null;
  };

  const stopsAwayMessage = renderStopsAwayMessage();

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
            <span className={styles.arrivalLabel}>
              {arrivalMinutes < 0 ? "到着済み" : "到着予定"}
            </span>
            <span className={styles.arrivalMinutes}>
              {Math.abs(arrivalMinutes)}
            </span>
            <span className={styles.arrivalUnit}>
              {arrivalMinutes < 0 ? "分前" : "分後"}
            </span>
            <span className={styles.arrivalTime}>({arrivalTime})</span>
          </div>
          {stopsAwayMessage && (
            <p className={styles.stopsAway}>{stopsAwayMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};
