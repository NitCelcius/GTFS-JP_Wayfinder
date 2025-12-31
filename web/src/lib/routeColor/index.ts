/**
 * Route color module - generates colors based on GTFS route text
 * Supports light/dark mode with different lightness values.
 *
 * Uses weighted hash algorithm where earlier characters have more influence.
 * Similar text → similar colors, different first characters → different colors.
 */

export {
  // Main API
  textToColor,
  textToLch,
  textToDualColor,
  // Hash function (for debugging/analysis)
  weightedTextHash,
  DEFAULT_HASH_BASE,
  // Color conversion utility
  lchToRgb,
  // Types
  type ColorMode,
  type LchColor,
  type RgbColor,
  type RouteColorResult,
  type DualModeColorResult,
} from "./colorGenerator";
