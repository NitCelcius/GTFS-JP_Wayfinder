interface SearchConditionsSummaryProps {
  departureTime: string;
}

import styles from "./SearchConditionsSummary.module.css";

export function SearchConditionsSummary({
  departureTime,
}: SearchConditionsSummaryProps) {
  return (
    <div className={styles.container} data-name="SearchConditionsSummary">
      <div className={styles.header}>
        <div className={styles.title}>
          <p className={styles.titleText}>検索条件</p>
        </div>

        <div className={styles.divider} data-name="Divider">
          <div className={styles.dividerSvg}>
            <svg
              className={styles.dividerSvgElement}
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 346 1"
            >
              <line
                stroke="var(--stroke-0, #8A8A8F)"
                strokeWidth="0.5"
                x1="0.00048828"
                x2="346"
                y1="0.75"
                y2="0.75"
              />
            </svg>
          </div>
        </div>

        <div className={styles.departureTime}>
          <div className={styles.departureTimeLabel}>
            <p className={styles.departureTimeText}>出発時刻 {departureTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
