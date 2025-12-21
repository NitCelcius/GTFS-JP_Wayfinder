/**
 * Route number extraction orchestrator
 *
 * This module provides a configurable system for extracting route numbers
 * from GTFS data. Different transit agencies encode route information in
 * different ways - some in trip_id, some in route_id, some in route_short_name.
 *
 * The orchestrator tries extractors in order until one succeeds, then falls
 * back to standard GTFS fields.
 */
import { extractAkitaChuoKotsu } from "./extractors";
import type { RouteExtractionContext, RouteExtractor } from "./types";

/**
 * Ordered list of provider-specific extractors to try.
 * Add new extractors here as needed for different transit agencies.
 */
const EXTRACTORS: RouteExtractor[] = [
  extractAkitaChuoKotsu,
  // Add more provider-specific extractors here
];

/**
 * Extract route number from GTFS data with provider-specific handling
 *
 * **Strategy:**
 * 1. Try each provider-specific extractor in order
 * 2. Fall back to route_short_name if available
 * 3. Fall back to route_long_name if available
 * 4. Return fallback value
 *
 * **Usage:**
 * ```typescript
 * const routeNumber = extractRouteNumber({
 *   trip_id: "平日_05時11分_系統6001",
 *   route_short_name: "都心循環線",
 * }); // Returns "600" (from Akita Chuo Kotsu extractor)
 *
 * const routeNumber = extractRouteNumber({
 *   trip_id: "trip_123",
 *   route_short_name: "Route 5",
 * }); // Returns "Route 5" (fallback to route_short_name)
 * ```
 *
 * @param context - GTFS data fields to extract from
 * @param fallback - Default value if all extraction attempts fail (default: "")
 * @returns Extracted route number
 */
export function extractRouteNumber(
  context: RouteExtractionContext,
  fallback: string = ""
): string {
  // Try each provider-specific extractor
  for (const extractor of EXTRACTORS) {
    const result = extractor(context);
    if (result.routeNumber !== null) {
      return result.routeNumber;
    }
  }

  // Fall back to standard GTFS fields in order of preference
  // Filter out null values (API returns string | null, but we want string | undefined)
  if (context.route_short_name != null && context.route_short_name !== "") {
    return context.route_short_name;
  }

  if (context.route_long_name != null && context.route_long_name !== "") {
    return context.route_long_name;
  }

  // All extraction attempts failed
  return fallback;
}
