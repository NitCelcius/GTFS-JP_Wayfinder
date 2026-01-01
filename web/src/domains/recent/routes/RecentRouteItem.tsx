import { Route } from "lucide-react";

import { RecentRouteSearch } from "../types";
import styles from "./RecentRouteItem.module.css";

interface RecentRouteItemProps {
  route: RecentRouteSearch;
  onSelect?: (
    fromStopId: string,
    toStopId: string,
    fromStation: string,
    toStation: string
  ) => void;
}

function RouteIcon() {
  return <Route size={24} aria-hidden="true" />;
}

export function RecentRouteItem({ route, onSelect }: RecentRouteItemProps) {
  const handleClick = () =>
    onSelect?.(
      route.fromStopId,
      route.toStopId,
      route.fromStopName,
      route.toStopName
    );

  return (
    <div onClick={handleClick} className={styles.listItem}>
      <div className={styles.itemRow}>
        <div className={styles.iconWrap}>
          <RouteIcon />
        </div>
        <div>
          <span
            className={styles.routeText}
          >{`${route.fromStopName} → ${route.toStopName}`}</span>
          <div className={styles.timestamp}>{route.searchedAt}</div>
        </div>
      </div>
    </div>
  );
}
