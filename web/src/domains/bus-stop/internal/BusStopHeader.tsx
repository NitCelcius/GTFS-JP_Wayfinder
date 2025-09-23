import React from "react";

import styles from "./BusStopHeader.module.css";

interface BusStopHeaderProps {
  name: string;
  distance: string;
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

export function BusStopHeader({ name, distance }: BusStopHeaderProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.leftSection}>
          <div className={styles.icon}>
            <LocationIcon />
          </div>
          <span className={styles.busStopName}>{name}</span>
        </div>
        <span className={styles.distance}>{distance}</span>
      </div>
    </div>
  );
}
