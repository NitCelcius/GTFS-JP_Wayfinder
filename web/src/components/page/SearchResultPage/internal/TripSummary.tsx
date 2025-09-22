import { Route } from "../types";
import styles from "./TripSummary.module.css";

interface TripSummaryProps {
  route: Route;
}

export function TripSummary({ route }: TripSummaryProps) {
  return (
    <div className={styles.container} data-name="TripSummary">
      <div className={styles.timeRange}>
        <div className={styles.timeText}>
          <p className={styles.timeTextContent}>
            {route.departureTime} → {route.arrivalTime} ({route.duration})
          </p>
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.detailsText}>
          <p className={styles.detailsTextContent}>
            乗換 {route.transferCount}回 / 合計 {route.totalCost}円
          </p>
        </div>
      </div>
    </div>
  );
}
