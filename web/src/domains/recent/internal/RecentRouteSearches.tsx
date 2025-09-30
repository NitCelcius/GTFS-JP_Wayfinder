import { RecentRouteSearch } from "../types";
import styles from "./RecentRouteSearches.module.css";
import viewMoreStyles from "./ViewMoreButton.module.css";

interface RecentRouteSearchesProps {
  recentRoutes: RecentRouteSearch[];
  // call with (fromStation, toStation) to match RecentPage handler
  onRouteSelect?: (fromStation: string, toStation: string) => void;
  onViewMore?: () => void;
}

function RouteIcon() {
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
        d="M3 10h4l3 8 4-16 3 8h4"
      />
    </svg>
  );
}

function RecentRouteItem({
  route,
  onSelect,
}: {
  route: RecentRouteSearch;
  onSelect?: (fromStation: string, toStation: string) => void;
}) {
  const handleClick = () => onSelect?.(route.fromStation, route.toStation);

  return (
    <div onClick={handleClick} className={styles.listItem}>
      <div className={styles.itemRow}>
        <div className={styles.iconWrap}>
          <RouteIcon />
        </div>
        <div>
          <span
            className={styles.routeText}
          >{`${route.fromStation} → ${route.toStation}`}</span>
          <div className={styles.timestamp}>{route.searchedAt}</div>
        </div>
      </div>
    </div>
  );
}

export function RecentRouteSearches({
  recentRoutes,
  onRouteSelect,
  onViewMore,
}: RecentRouteSearchesProps) {
  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.heading}>行き方</h2>
        {recentRoutes.length > 0 && (
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
          {recentRoutes.map((r) => (
            <RecentRouteItem key={r.id} route={r} onSelect={onRouteSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
