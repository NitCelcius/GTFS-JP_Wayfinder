import { ChevronRight, Flag, MapPin } from "lucide-react";

import styles from "./RouteOptionCard.module.css";

/**
 * Props for the RouteOptionCard component
 */
export interface RouteOptionCardProps {
  /** Relative time description (e.g., "5分後にバス停発") */
  relativeTimeUntilDeparture: string;
  /** Departure time in HH:MM format */
  departureTime: string;
  /** Arrival time in HH:MM format */
  arrivalTime: string;
  /** Duration display string (e.g., "15分") */
  duration: string;
  /** Fare in yen (optional) */
  fare?: number;
  /** Number of transfers required */
  transfers: number;
  /** Progress bar width percentage (0-100) for visual comparison */
  progressPercentage: number;
  /** Callback when the card is clicked */
  onClick: () => void;
}

/**
 * Card component displaying a single route option with time, duration, fare, and visual progress indicator.
 * Used in the route overview page to show available route options.
 */
export function RouteOptionCard({
  relativeTimeUntilDeparture,
  departureTime,
  arrivalTime,
  duration,
  fare,
  transfers,
  progressPercentage,
  onClick,
}: RouteOptionCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      className={styles.ticketContainer}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`${relativeTimeUntilDeparture}、${departureTime}発 ${arrivalTime}着、所要時間${duration}の経路を選択`}
    >
      <div className={styles.ticketContent}>
        <div className={styles.header}>
          <div className={styles.relativeTime}>
            {relativeTimeUntilDeparture}
          </div>
        </div>

        <div className={styles.timeDetails}>
          {departureTime} 発 → {arrivalTime} 着 (所要 {duration})
        </div>

        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${progressPercentage}%` }}
          >
            <span className={styles.departurePin}>
              {" "}
              <MapPin size={16} />
            </span>
            <div className={styles.progressLine} />
            <span className={styles.arrivalFlag}>
              <Flag size={16} />
            </span>
          </div>
        </div>

        <div className={styles.detailsRow}>
          {fare !== undefined && (
            <span className={styles.detailText}>運賃 {fare}円</span>
          )}
          <span className={styles.detailText}>乗り換え {transfers}回</span>
        </div>
      </div>

      <div className={styles.chevronContainer}>
        <ChevronRight size={24} />
      </div>
    </button>
  );
}
