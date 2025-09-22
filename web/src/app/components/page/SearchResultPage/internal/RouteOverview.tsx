interface RouteOverviewProps {
  fromStation: string;
  toStation: string;
}

import styles from "./RouteOverview.module.css";

export function RouteOverview({ fromStation, toStation }: RouteOverviewProps) {
  return (
    <div className={styles.container} data-name="RouteOverview">
      <div className={styles.text}>
        <p className={styles.textContent}>
          {fromStation} から {toStation} まで
        </p>
      </div>
    </div>
  );
}
