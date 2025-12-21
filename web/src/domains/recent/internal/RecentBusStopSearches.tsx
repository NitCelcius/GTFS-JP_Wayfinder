import Image from "next/image";
import React from "react";

import { BusStopCard } from "@/components/common";

import { RecentBusStopSearch } from "../types";
import viewMoreStyles from "./ViewMoreButton.module.css";

interface RecentBusStopSearchesProps {
  recentBusStops: RecentBusStopSearch[];
  onBusStopSelect?: (busStopId: string) => void;
  onViewMore?: () => void;
}

function LocationIcon() {
  return (
    <Image
      src="/icons/location-pin.svg"
      alt=""
      width={24}
      height={24}
      unoptimized
      className="block size-full"
      aria-hidden="true"
    />
  );
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
}: RecentBusStopSearchesProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-[var(--size-spacing-lg)]">
        <h2 className="text-[1.25rem]">バス停</h2>
        {recentBusStops.length > 0 && (
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
          {recentBusStops.map((bs) => (
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
