import React from "react";

import { Icon } from "@/components/common";

interface MapSearchIconProps {
  size?: number;
}

export function MapSearchIcon({ size = 24 }: MapSearchIconProps) {
  return <Icon name="map-search" size={size} />;
}
