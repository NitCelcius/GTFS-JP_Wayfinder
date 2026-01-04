import { Button } from "@/components/common/Button/Button";

import styles from "./SearchConditions.module.css";

function SearchHeader() {
  return (
    <div className={styles.searchHeader}>
      <div className={styles.searchHeaderTitle}>
        <p className={styles.searchHeaderText}>検索条件</p>
      </div>
      <Button
        text="リセット"
        className={styles.resetButton}
        onClick={() => {}}
      />
    </div>
  );
}

function Divider() {
  return (
    <div className={styles.divider}>
      <div className={styles.dividerSvg}>
        <svg
          className={styles.dividerSvgElement}
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 346 1"
        >
          <line
            id="Line 1"
            stroke="var(--color-stroke-muted)"
            strokeWidth="0.5"
            x1="0.00048828"
            x2="346"
            y1="0.75"
            y2="0.75"
          />
        </svg>
      </div>
    </div>
  );
}

function DepartureTime() {
  return (
    <div className={styles.departureTime}>
      <div className={styles.departureTimeContent}>
        <div className={styles.departureTimeInner}>
          <div className={styles.departureTimeLabel}>
            <p className={styles.departureTimeText}>出発時刻</p>
          </div>
          <div className={styles.departureTimeValue}>
            <p className={styles.departureTimeValueText}>今すぐ</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchConditions() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.inner}>
          <SearchHeader />
          <Divider />
          <DepartureTime />
        </div>
      </div>
    </div>
  );
}
