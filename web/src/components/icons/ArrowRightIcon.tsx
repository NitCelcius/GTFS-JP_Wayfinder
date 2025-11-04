import React from "react";

import { Icon } from "@/components/common";

interface ArrowRightIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ArrowRightIcon({
  size = 32,
  color = "currentColor",
  className,
  style,
}: ArrowRightIconProps) {
  return (
    <Icon
      name="arrow-right"
      size={size}
      className={className}
      style={{ color, ...style }}
    />
  );
}
