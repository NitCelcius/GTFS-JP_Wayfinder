/**
 * Route number extraction module
 *
 * Provides utilities for extracting route numbers from GTFS data with
 * support for provider-specific formats.
 */

export { extractRouteNumber } from "./extractor";
export type {
  RouteExtractionContext,
  RouteExtractionResult,
  RouteExtractor,
} from "./types";
