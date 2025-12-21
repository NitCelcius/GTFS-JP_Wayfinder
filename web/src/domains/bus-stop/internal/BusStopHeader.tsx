import React from "react";

import { Icon } from "@/components/common/Icon/Icon";

import styles from "./BusStopHeader.module.css";

interface BusStopHeaderProps {
  name: string;
  platformCode?: string | null;
  distance: string;
  busStopId?: string;
  onShareClick?: () => void;
}

function LocationIcon() {
  return <Icon name="location-pin" className="w-6 h-6" aria-hidden="true" />;
}

function ShareIcon() {
  return <Icon name="share" className="w-6 h-6" aria-hidden="true" />;
}

export function BusStopHeader({
  name,
  platformCode,
  distance,
  busStopId,
  onShareClick,
}: BusStopHeaderProps) {
  // Format the display name with platform code if available
  const displayName = platformCode ? `${name} ${platformCode}番のりば` : name;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.leftSection}>
          <div className={styles.icon}>
            <LocationIcon />
          </div>
          <span className={styles.busStopName}>{displayName}</span>
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
