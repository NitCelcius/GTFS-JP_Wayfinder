/**
 * Hook for generating route colors with dark mode support.
 *
 * Uses media query to detect dark mode and generates appropriate colors
 * using the route color generator.
 */
import { useEffect, useState } from "react";

import { type RouteColorResult, textToColor } from "@/lib/routeColor";

/** Color info with separate background and text colors for flexibility */
export interface RouteColorInfo {
  /** Background color as hex string (e.g., "#d4a574") */
  backgroundColor: string;
  /** Text color for contrast - "white" or "black" */
  textColor: "white" | "black";
}

/** Default fallback when no route text is provided */
const DEFAULT_COLOR: RouteColorInfo = {
  backgroundColor: "var(--primaryaccent)",
  textColor: "black",
};

/**
 * Hook to generate route colors based on route text with dark mode awareness.
 *
 * @param routeText - The text to generate color from (route_name, route_id, etc.)
 * @returns RouteColorInfo with backgroundColor and textColor
 *
 * @example
 * ```tsx
 * function RouteCard({ routeName }: { routeName: string }) {
 *   const { backgroundColor, textColor } = useRouteColor(routeName);
 *   return (
 *     <div style={{ backgroundColor, color: textColor }}>
 *       {routeName}
 *     </div>
 *   );
 * }
 * ```
 */
export function useRouteColor(
  routeText: string | null | undefined
): RouteColorInfo {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial dark mode preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Return default if no route text
  if (!routeText) {
    return DEFAULT_COLOR;
  }

  // Generate color based on current mode
  const colorResult = textToColor(routeText, isDarkMode ? "dark" : "light");

  return {
    backgroundColor: colorResult.hex,
    textColor: colorResult.textColor,
  };
}

/**
 * Non-hook utility for generating route colors.
 * Use when you need colors outside of React components or need SSR compatibility.
 *
 * @param routeText - The text to generate color from
 * @param isDarkMode - Whether dark mode is active
 * @returns RouteColorInfo with backgroundColor and textColor
 */
export function getRouteColors(
  routeText: string | null | undefined,
  isDarkMode: boolean = false
): RouteColorInfo {
  if (!routeText) {
    return DEFAULT_COLOR;
  }

  const colorResult = textToColor(routeText, isDarkMode ? "dark" : "light");

  return {
    backgroundColor: colorResult.hex,
    textColor: colorResult.textColor,
  };
}

// Re-export RouteColorResult for consumers who need the full result
export type { RouteColorResult };
