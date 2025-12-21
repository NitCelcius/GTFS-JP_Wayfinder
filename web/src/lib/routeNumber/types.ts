/**
 * GTFS data fields that can be used for route number extraction
 */
export interface RouteExtractionContext {
  /** GTFS trip_id - may contain encoded route information */
  trip_id: string;
  /** GTFS route_id - identifies the route */
  route_id?: string;
  /** GTFS service_id - identifies the service calendar */
  service_id?: string;
  /** GTFS route_short_name - standard short name for the route */
  route_short_name?: string;
  /** GTFS route_long_name - full descriptive name for the route */
  route_long_name?: string;
}

/**
 * Result of a route number extraction attempt
 */
export interface RouteExtractionResult {
  /** The extracted route number, or null if extraction failed */
  routeNumber: string | null;
  /** Which field was used for extraction */
  source: keyof RouteExtractionContext | "default";
}

/**
 * Function signature for provider-specific route extractors
 */
export type RouteExtractor = (
  context: RouteExtractionContext
) => RouteExtractionResult;
