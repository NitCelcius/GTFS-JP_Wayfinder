import React from "react";

interface MapSearchIconProps {
  size?: number;
  className?: string;
}

export function MapSearchIcon({
  size = 24,
  className = "",
}: MapSearchIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
      <path d="M9 11h6" />
      <path d="M12 8v6" />
    </svg>
  );
}
