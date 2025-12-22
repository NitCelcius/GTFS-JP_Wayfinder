import React from "react";

import Image, { type ImageProps } from "next/image";

interface IconProps
  extends Omit<ImageProps, "src" | "alt" | "width" | "height" | "aria-hidden"> {
  name: string;
  size?: number | string;
}

/**
 * Icon component that loads SVG icons from /public/icons directory.
 * Wraps Next.js Image with `unoptimized` for SVG files.
 *
 * @param {string} name - Icon filename without extension (e.g., "search", "close")
 * @param {number|string} [size=24] - Icon size: number for px (e.g., 24, 100) or CSS value (e.g., "2rem")
 * @param {string} [className=""] - Additional CSS classes (note: conflicts with numeric size due to inline styles precedence)
 * @param {React.CSSProperties} [style] - Additional inline styles (merged after size styles)
 * @param {...} rest - Additional Image props (aria-hidden is always "true" for decorative icons)
 *
 * @note aria-hidden is always "true" (cannot be overridden). For semantic icons, use img directly.
 */
export function Icon({
  name,
  size = 24,
  className = "",
  style,
  ...rest
}: IconProps) {
  // Validate icon name to prevent directory traversal attacks
  if (!/^[a-z0-9-]+$/.test(name)) {
    console.error(`Invalid icon name: ${name}`);
    return null;
  }

  // Handle size: numeric values are used for width/height and style,
  // string values are only applied as inline styles
  let numericSize = 24;
  let stringSize: string | undefined;

  if (typeof size === "number") {
    numericSize = size;
    stringSize = `${size}px`;
  } else if (typeof size === "string") {
    // Try to parse string size (e.g., "100px" -> 100, "2rem" stays as-is)
    const parsed = parseInt(size, 10);
    if (!isNaN(parsed) && size.includes("px")) {
      numericSize = parsed;
      stringSize = size;
    } else {
      // CSS variable or unit without px (e.g., "2rem", "var(--size)")
      stringSize = size;
      // Use a reasonable default for intrinsic sizing when size is a CSS var
      numericSize = 48;
    }
  }

  return (
    <Image
      src={`/icons/${name}.svg`}
      alt=""
      width={numericSize}
      height={numericSize}
      unoptimized
      className={className}
      style={{
        width: stringSize,
        height: stringSize,
        ...style,
      }}
      aria-hidden="true"
      {...rest}
    />
  );
}
