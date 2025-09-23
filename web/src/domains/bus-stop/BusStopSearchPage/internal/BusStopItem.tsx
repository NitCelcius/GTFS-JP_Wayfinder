import React from "react";

import { BusStopCard } from "@/components/common";

import { BusStop } from "./BusStopList";

interface BusStopItemProps {
  busStop: BusStop;
  onSelect?: (busStopId: string) => void;
}

function LocationIcon() {
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
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

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
      icon={<LocationIcon />}
      actionLabel="選択"
      onClick={handleCardClick}
      onActionClick={handleActionClick}
    />
  );
}
