import React from "react";

import { Icon } from "@/components/common";

interface LocationPinIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function LocationPinIcon({
  size = 40,
  color = "currentColor",
  className,
  style,
}: LocationPinIconProps) {
  return (
    <Icon
      name="location-pin"
      size={size}
      className={className}
      style={{ color, ...style }}
    />
  );
}
