import React from "react";

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
}) => {
  return (
    <div className={styles.tripIndicatorWrapper}>
      <div className={styles.busFront}>
        <img
          src="/icons/bus-container-front.svg"
          alt="Bus front"
          className={styles.busFrontSvg}
        />
      </div>
      <div className={styles.tripIndicatorContainer}>
        <div className={styles.topSection}>
          <div className={styles.routeNumber}>{routeNumber}</div>
          <div className={styles.rightContainer}>
            <div className={styles.routeDetails}>
              <p className={styles.routeName}>{routeName}</p>
              <div className={styles.destinationRow}>
                <img
                  src="/icons/location-pin.svg"
                  alt="目的地"
                  width="28"
                  height="28"
                  className={styles.locationIcon}
                />
                <p className={styles.destinationName}>{destinationName}行</p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.bottomSection}>
          <div className={styles.arrivalSection}>
            <span className={styles.arrivalLabel}>到着予定</span>
            <span className={styles.arrivalMinutes}>{arrivalMinutes}</span>
            <span className={styles.arrivalUnit}>分後</span>
            <span className={styles.arrivalTime}>({arrivalTime})</span>
          </div>
          <p className={styles.stopsAway}>
            {stopsAway === 0
              ? "まもなく到着"
              : stopsAway < 0
                ? `${Math.abs(stopsAway)}駅先に到着`
                : `${stopsAway}駅前に到着`}
          </p>
        </div>
      </div>
    </div>
  );
};
