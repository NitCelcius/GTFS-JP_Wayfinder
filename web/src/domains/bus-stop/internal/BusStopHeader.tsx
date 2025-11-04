import React from "react";

import styles from "./BusStopHeader.module.css";

interface BusStopHeaderProps {
  name: string;
  distance: string;
  busStopId?: string;
  onShareClick?: () => void;
}

function LocationIcon() {
  return (
    <img
      src="/icons/location-pin.svg"
      alt=""
      className="block size-full"
      aria-hidden="true"
    />
  );
}

function ShareIcon() {
  return (
    <img
      src="/icons/share.svg"
      alt=""
      className="block size-full"
      aria-hidden="true"
    />
  );
}

export function BusStopHeader({
  name,
  distance,
  busStopId,
  onShareClick,
}: BusStopHeaderProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.leftSection}>
          <div className={styles.icon}>
            <LocationIcon />
          </div>
          <span className={styles.busStopName}>{name}</span>
        </div>
        <div className={styles.rightSection}>
          {busStopId && (
            <button
              className={styles.shareButton}
              onClick={onShareClick}
              aria-label="共有"
            >
              <div className={styles.shareIcon}>
                <ShareIcon />
              </div>
              <span className={styles.shareLabel}>共有</span>
            </button>
          )}
          <span className={styles.distance}>{distance}</span>
        </div>
      </div>
    </div>
  );
}
