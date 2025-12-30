import styles from "./SearchSummary.module.css";

/**
 * Props for the SearchSummary component
 */
export interface SearchSummaryProps {
  /** Search date and time display string */
  searchDateTime: string;
}

/**
 * Summary component showing the search timestamp for the route results.
 * Displays when the route search was performed.
 */
export function SearchSummary({ searchDateTime }: SearchSummaryProps) {
  return (
    <div className={styles.searchTime}>
      <span className={styles.searchTimeLabel}>検索時刻</span>
      <span className={styles.searchTimeValue}>{searchDateTime}</span>
    </div>
  );
}
