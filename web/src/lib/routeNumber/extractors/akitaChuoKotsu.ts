/**
 * Route number extractor for Akita Chuo Kotsu (秋田中央交通)
 *
 * This transit agency uses a special trip_id format that encodes the route number.
 * Trip IDs are formatted as: "平日_05時11分_系統6001"
 * where the route number is the first 3 digits after "系統".
 *
 * @example
 * // Trip ID: "平日_05時11分_系統6001" → Route: "600"
 * // Trip ID: "土日_12時30分_系統1234" → Route: "123"
 */
import type { RouteExtractionContext, RouteExtractionResult } from "../types";

/**
 * Extract route number from Akita Chuo Kotsu trip_id format
 *
 * @param context - GTFS data fields
 * @returns Extraction result with route number and source field
 */
export function extractAkitaChuoKotsu(
  context: RouteExtractionContext
): RouteExtractionResult {
  // Pattern: "系統" followed by at least 3 digits
  const routeNumberMatch = context.trip_id.match(/系統(\d{3})/);

  if (routeNumberMatch) {
    return {
      routeNumber: routeNumberMatch[1],
      source: "trip_id",
    };
  }

  // Extraction failed - return null to try next strategy
  return {
    routeNumber: null,
    source: "trip_id",
  };
}
