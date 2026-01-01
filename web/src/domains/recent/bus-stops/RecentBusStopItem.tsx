import { MapPin } from "lucide-react";

import React from "react";

import { BusStopCard } from "@/components/common";

import { RecentBusStopSearch } from "../types";

interface RecentBusStopItemProps {
  busStop: RecentBusStopSearch;
  onSelect?: (id: string) => void;
}

export function RecentBusStopItem({
  busStop,
  onSelect,
}: RecentBusStopItemProps) {
  const handleCardClick = () => onSelect?.(busStop.id);
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(busStop.id);
  };

  // Don't show distance for recent searches
  const displayDistance =
    busStop.distance && busStop.distance !== "位置情報無効"
      ? busStop.distance
      : undefined;

  return (
    <BusStopCard
      title={busStop.name}
      subtitle={displayDistance}
      icon={<MapPin size={24} aria-hidden="true" />}
      actionLabel="選択"
      onClick={handleCardClick}
      onActionClick={handleActionClick}
      secondaryInfo={busStop.searchedAt}
    />
  );
}
