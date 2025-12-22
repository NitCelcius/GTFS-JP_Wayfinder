import styles from "./BusStopHeader.module.css";

interface ChevronIconProps {
  className?: string;
}

function ChevronIcon({ className }: ChevronIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

interface BusStopHeaderProps {
  busStopName: string;
  platformCode?: string | null;
  distance?: string;
  onBack?: () => void;
}

export function BusStopHeader({
  busStopName,
  platformCode,
  distance,
  onBack,
}: BusStopHeaderProps) {
  return (
    <div className={styles.headerRow}>
      <div className={styles.headerLeft}>
        <button
          className={styles.backButton}
          onClick={onBack}
          aria-label="Go back"
        >
          <ChevronIcon className={styles.chevronRotated} />
        </button>
        <div className={styles.busStopTitleContainer}>
          <h1 className={styles.busStopName}>{busStopName}</h1>
          <div className={styles.busStopSubInfo}>
            {platformCode && (
              <p className={styles.platformCode}>{platformCode}番のりば</p>
            )}
            {distance && <div className={styles.distanceLabel}>{distance}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
