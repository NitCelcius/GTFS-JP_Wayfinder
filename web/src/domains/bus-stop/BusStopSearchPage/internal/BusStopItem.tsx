import { MapPin } from "lucide-react";

import React from "react";

import { BusStopCard } from "@/components/common";

import { BusStopListProps } from "./BusStopList";

interface BusStopItemProps {
  busStop: BusStopListProps["busStops"][0];
  onSelect?: (busStopId: string) => void;
}

// Using shared LocationIcon component; no local SVG duplication.

export function BusStopItem({ busStop, onSelect }: BusStopItemProps) {
  const handleCardClick = () => {
    onSelect?.(busStop.id);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when button is clicked
    onSelect?.(busStop.id);
  };

  return (
    <BusStopCard
      title={busStop.name}
      subtitle={busStop.distance}
      icon={<MapPin size={24} />}
      actionLabel="選択"
      onClick={handleCardClick}
      onActionClick={handleActionClick}
    />
  );
}
