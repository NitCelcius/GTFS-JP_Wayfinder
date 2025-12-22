import React from "react";

import { Icon } from "@/components/common";

interface MapSearchIconProps {
  size?: number;
  className?: string;
}

export function MapSearchIcon({
  size = 24,
  className = "",
}: MapSearchIconProps) {
  return <Icon name="map-search" size={size} className={className} />;
}
