import styles from "./SearchSummary.module.css";

interface SearchSummaryProps {
  fromStation: string;
  toStation: string;
  searchDateTime: string;
}

export function SearchSummary({
  fromStation,
  toStation,
  searchDateTime,
}: SearchSummaryProps) {
  return (
    <div className={styles.container}>
      <div className={styles.routeInfo}>
        <div className={styles.stationRow}>
          <span className={styles.label}>出発</span>
          <span className={styles.stationName}>{fromStation}</span>
        </div>
        <div className={styles.arrow}>↓</div>
        <div className={styles.stationRow}>
          <span className={styles.label}>到着</span>
          <span className={styles.stationName}>{toStation}</span>
        </div>
      </div>
      <div className={styles.timeInfo}>
        <span className={styles.timeLabel}>検索時刻</span>
        <span className={styles.timeValue}>{searchDateTime}</span>
      </div>
    </div>
  );
}
