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
    <svg
      className="block size-full"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      className="block size-full"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
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
