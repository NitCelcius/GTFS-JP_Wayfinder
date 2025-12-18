import React from "react";

import { type Stop, StopItem } from "../StopItem";
import styles from "./StopsList.module.css";

export interface StopsListProps {
  stops: Stop[];
}

/**
 * StopsList displays the list of stops for a bus trip.
 */
interface DividerProps {
  hasGrayBackground: boolean;
}

const Divider: React.FC<DividerProps> = ({ hasGrayBackground }) => (
  <div
    className={`${styles.divider} ${hasGrayBackground ? styles.dividerGray : ""}`}
  >
    <div className={styles.arrow}>↓</div>
  </div>
);

export const StopsList: React.FC<StopsListProps> = ({ stops }) => {
  return (
    <div className={styles.stopsListContainer}>
      {stops.map((stop, index) => (
        <React.Fragment key={stop.id}>
          <StopItem stop={stop} />
          {index < stops.length - 1 && (
            <Divider hasGrayBackground={stop.isPassed} />
          )}
        </React.Fragment>
      ))}
      <p className={styles.endMessage}>終点に到着しました</p>
    </div>
  );
};
