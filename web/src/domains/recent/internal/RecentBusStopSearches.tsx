import { MapPin } from "lucide-react";

import React from "react";

import { BusStopCard } from "@/components/common";

import { RecentBusStopSearch } from "../types";
import viewMoreStyles from "./ViewMoreButton.module.css";

interface RecentBusStopSearchesProps {
  recentBusStops: RecentBusStopSearch[];
  onBusStopSelect?: (busStopId: string) => void;
  onViewMore?: () => void;
  limit?: number;
}

function LocationIcon() {
  return <MapPin size={24} aria-hidden="true" />;
}

function RecentBusStopItem({
  busStop,
  onSelect,
}: {
  busStop: RecentBusStopSearch;
  onSelect?: (id: string) => void;
}) {
  const handleCardClick = () => onSelect?.(busStop.id);
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(busStop.id);
  };

  return (
    <BusStopCard
      title={busStop.name}
      subtitle={busStop.distance}
      icon={<LocationIcon />}
      actionLabel="選択"
      onClick={handleCardClick}
      onActionClick={handleActionClick}
      secondaryInfo={busStop.searchedAt}
    />
  );
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
        <h2 className="text-[1.25rem]">バス停</h2>
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
              key={bs.id}
              busStop={bs}
              onSelect={onBusStopSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
