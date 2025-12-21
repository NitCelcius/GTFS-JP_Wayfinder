import React from "react";

import Image, { type ImageProps } from "next/image";

interface IconProps
  extends Omit<ImageProps, "src" | "alt" | "width" | "height"> {
  name: string;
  size?: number | string;
}

/**
 * Icon component that loads SVG icons from /public/icons directory.
 * Uses `width` and `height` props for intrinsic sizing, allowing
 * flexible overrides via `className` or `size`.
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

  const numericSize = typeof size === "number" ? size : 24;
  const stringSize = typeof size === "string" ? size : undefined;

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
