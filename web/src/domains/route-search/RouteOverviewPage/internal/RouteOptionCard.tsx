import { Card } from "@/components/common";

import type { RouteOption } from "../types";
import styles from "./RouteOptionCard.module.css";

interface RouteOptionCardProps {
  route: RouteOption;
  onSelect: () => void;
}

export function RouteOptionCard({ route, onSelect }: RouteOptionCardProps) {
  return (
    <Card onClick={onSelect}>
      <div className={styles.container}>
        <div className={styles.timeSection}>
          <div className={styles.timeRow}>
            <span className={styles.timeLabel}>出発</span>
            <span className={styles.timeValue}>{route.departureTime}</span>
          </div>
          <div className={styles.timeRow}>
            <span className={styles.timeLabel}>到着</span>
            <span className={styles.timeValue}>{route.arrivalTime}</span>
          </div>
        </div>

        <div className={styles.detailsSection}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>所要時間</span>
            <span className={styles.detailValue}>{route.duration}</span>
          </div>
          {route.fare !== undefined && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>運賃</span>
              <span className={styles.detailValue}>{route.fare}円</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
