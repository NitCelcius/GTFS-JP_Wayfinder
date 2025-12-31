import { Footprints } from "lucide-react";

import styles from "./WalkTransferIndicator.module.css";

export interface WalkTransferIndicatorProps {
  /**
   * Name of the station where the transfer occurs (from API's stop_names[0])
   */
  transferStationName: string;
  /**
   * Platform number from API's platform_code field (via GET /stops/{stop_id})
   * Optional - if undefined, will display transfer without platform number
   * Example: "1", "2", "A", "北口" etc.
   */
  platformCode?: string;
  /**
   * Custom class name for styling
   */
  className?: string;
}

/**
 * Displays a walk transfer indicator between bus segments.
 * Shows a walking icon and text indicating platform transfer at a station.
 *
 * Example: "秋田駅東口 2番のりばで乗り換え"
 */
export function WalkTransferIndicator({
  transferStationName,
  platformCode,
  className,
}: WalkTransferIndicatorProps) {
  // Build the transfer message
  const transferMessage = platformCode
    ? `${transferStationName} ${platformCode}番のりばへ乗り換え`
    : `${transferStationName}へ乗り換え`;

  return (
    <div className={`${styles.container} ${className ?? ""}`}>
      <div className={styles.iconWrapper}>
        <Footprints size={20} aria-hidden="true" />
      </div>
      <span className={styles.text}>{transferMessage}</span>
    </div>
  );
}
