import { Share2 } from "lucide-react";

import styles from "./RouteOverview.module.css";

interface RouteOverviewProps {
  fromStation: string;
  toStation: string;
  searchUrl?: string;
  onShareClick?: () => void;
}

function ShareIcon() {
  return <Share2 size={24} aria-hidden="true" />;
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
