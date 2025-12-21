import React from "react";

import { Icon } from "@/components/common/Icon/Icon";

import styles from "./StopItem.module.css";

export interface Stop {
  id: string;
  name: string;
  arrivalTime: string;
  fare?: number;
  isCurrent: boolean;
  isBusLocation: boolean;
  isDestination: boolean;
  isPassed: boolean;
}

export interface StopItemProps {
  stop: Stop;
}

/**
 * StopItem displays a single stop in the bus trip stops list.
 */
export const StopItem: React.FC<StopItemProps> = ({ stop }) => {
  const stopClasses = [
    styles.stopItem,
    stop.isPassed && styles.stopItemPassed,
    stop.isCurrent && styles.stopItemCurrent,
  ]
    .filter(Boolean)
    .join(" ");

  const arrivalTimeValue = stop.arrivalTime;
  const arrivalTimeSuffix = "着";
  const fareLabel = stop.fare ? `${stop.fare}円` : undefined;
  const currentLabel = stop.isCurrent ? "現在地" : undefined;

  return (
    <div className={stopClasses}>
      {stop.isBusLocation ? (
        <Icon name="bus-front" size={28} aria-hidden="true" />
      ) : stop.isCurrent ? (
        <Icon name="location-pin" size={28} aria-hidden="true" />
      ) : stop.isDestination ? (
        <Icon name="flag" size={28} aria-hidden="true" />
      ) : (
        <div className={styles.stopDot} />
      )}
      <div className={styles.stopContent}>
        <div className={styles.stopName}>{stop.name}</div>
        <div className={styles.stopRight}>
          {stop.isCurrent ? (
            <>
              {currentLabel && (
                <div className={styles.currentLabel}>{currentLabel}</div>
              )}
              <div className={styles.arrivalTimeContainer}>
                <span className={styles.arrivalTimeValue}>
                  {arrivalTimeValue}
                </span>
                <span className={styles.arrivalTimeSuffix}>
                  {arrivalTimeSuffix}
                </span>
              </div>
            </>
          ) : (
            <>
              {fareLabel && <div className={styles.fareLabel}>{fareLabel}</div>}
              <div className={styles.arrivalTimeContainer}>
                <span className={styles.arrivalTimeValue}>
                  {arrivalTimeValue}
                </span>
                <span className={styles.arrivalTimeSuffix}>
                  {arrivalTimeSuffix}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
