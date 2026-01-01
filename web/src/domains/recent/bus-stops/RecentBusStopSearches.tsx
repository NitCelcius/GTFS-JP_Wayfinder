import viewMoreStyles from "../ViewMoreButton.module.css";
import { RecentBusStopSearch } from "../types";
import { RecentBusStopItem } from "./RecentBusStopItem";

interface RecentBusStopSearchesProps {
  recentBusStops: RecentBusStopSearch[];
  onBusStopSelect?: (busStopId: string) => void;
  onViewMore?: () => void;
  limit?: number;
}

export function RecentBusStopSearches({
  recentBusStops,
  onBusStopSelect,
  onViewMore,
  limit,
}: RecentBusStopSearchesProps) {
  const displayedBusStops = limit
    ? recentBusStops.slice(0, limit)
    : recentBusStops;
  const hasMore = limit && recentBusStops.length > limit;

  return (
    <div>
      <div className="flex items-center justify-between mb-[var(--size-spacing-lg)]">
        {hasMore && (
          <button
            className={viewMoreStyles.viewMoreButton}
            onClick={onViewMore}
          >
            もっと見る
          </button>
        )}
      </div>
      {recentBusStops.length === 0 ? (
        <div className="text-center py-[var(--size-spacing-2xl)] text-gray-500">
          <p>履歴に検索したバス停はありません</p>
        </div>
      ) : (
        <div>
          {displayedBusStops.map((bs) => (
            <RecentBusStopItem
              key={bs.recordId}
              busStop={bs}
              onSelect={onBusStopSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
