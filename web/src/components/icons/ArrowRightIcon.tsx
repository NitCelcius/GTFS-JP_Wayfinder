import React from "react";

interface ArrowRightIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

export function ArrowRightIcon({
  size = 32,
  color = "currentColor",
  ...rest
}: ArrowRightIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}
