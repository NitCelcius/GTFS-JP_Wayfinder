import { Route } from "lucide-react";

import { RecentRouteSearch } from "../types";
import styles from "./RecentRouteSearches.module.css";
import viewMoreStyles from "./ViewMoreButton.module.css";

interface RecentRouteSearchesProps {
  recentRoutes: RecentRouteSearch[];
  // call with (fromStopId, toStopId, fromStopName, toStopName) to match RecentPage handler
  onRouteSelect?: (
    fromStopId: string,
    toStopId: string,
    fromStopName: string,
    toStopName: string
  ) => void;
  onViewMore?: () => void;
  limit?: number;
}

function RouteIcon() {
  return <Route size={24} aria-hidden="true" />;
}

function RecentRouteItem({
  route,
  onSelect,
}: {
  route: RecentRouteSearch;
  onSelect?: (
    fromStopId: string,
    toStopId: string,
    fromStation: string,
    toStation: string
  ) => void;
}) {
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

export { RecentRouteItem };

export function RecentRouteSearches({
  recentRoutes,
  onRouteSelect,
  onViewMore,
  limit,
}: RecentRouteSearchesProps) {
  const displayedRoutes = limit ? recentRoutes.slice(0, limit) : recentRoutes;
  const hasMore = limit && recentRoutes.length > limit;

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.heading}>行き方</h2>
        {hasMore && (
          <button
            className={viewMoreStyles.viewMoreButton}
            onClick={onViewMore}
          >
            もっと見る
          </button>
        )}
      </div>
      {recentRoutes.length === 0 ? (
        <div className={styles.emptyWrapper}>
          <p>履歴に検索した行き方はありません</p>
        </div>
      ) : (
        <div>
          {displayedRoutes.map((r) => (
            <RecentRouteItem key={r.id} route={r} onSelect={onRouteSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
