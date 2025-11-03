import styles from "./RouteOverview.module.css";

interface RouteOverviewProps {
  fromStation: string;
  toStation: string;
  searchUrl?: string;
  onShareClick?: () => void;
}

function ShareIcon() {
  return (
    <svg
      className="block size-full"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );
}

export function RouteOverview({
  fromStation,
  toStation,
  searchUrl,
  onShareClick,
}: RouteOverviewProps) {
  return (
    <div className={styles.container} data-name="RouteOverview">
      <div className={styles.wrapper}>
        <div className={styles.text}>
          <p className={styles.textContent}>
            {fromStation} から {toStation} まで
          </p>
        </div>
        {searchUrl && (
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
      </div>
    </div>
  );
}
