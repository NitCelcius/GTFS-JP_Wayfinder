/**
 * Provider-specific route number extractors
 *
 * Each extractor implements the RouteExtractor interface and attempts
 * to extract a route number from GTFS data fields. Extractors should
 * return null if they cannot extract a route number, allowing the
 * orchestrator to try alternative strategies.
 */

export { extractAkitaChuoKotsu } from "./akitaChuoKotsu";
