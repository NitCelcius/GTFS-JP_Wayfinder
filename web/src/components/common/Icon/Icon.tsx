import React from "react";

interface IconProps {
  name: string;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Icon component that loads SVG icons from /public/icons directory.
 *
 * Usage:
 *   <Icon name="arrow-back" size={24} />
 *   <Icon name="search" className="w-6 h-6" />
 */
export function Icon({ name, size, className = "", style }: IconProps) {
  // Validate icon name to prevent directory traversal attacks
  if (!/^[a-z0-9-]+$/.test(name)) {
    console.error(`Invalid icon name: ${name}`);
    return null;
  }

  const sizeStyle = size
    ? {
        width: typeof size === "number" ? `${size}px` : size,
        height: typeof size === "number" ? `${size}px` : size,
      }
    : {};

  return (
    <img
      src={`/icons/${name}.svg`}
      alt=""
      className={className}
      style={{ ...sizeStyle, ...style }}
      aria-hidden="true"
    />
  );
}
