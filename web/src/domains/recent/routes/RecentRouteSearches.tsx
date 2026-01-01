import viewMoreStyles from "../ViewMoreButton.module.css";
import { RecentRouteSearch } from "../types";
import { RecentRouteItem } from "./RecentRouteItem";
import styles from "./RecentRouteSearches.module.css";

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
