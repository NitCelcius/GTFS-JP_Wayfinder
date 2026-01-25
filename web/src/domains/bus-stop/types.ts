// Domain types for bus stop functionality (without Data suffix for clarity)

export interface BusStop {
  id: string;
  name: string;
  platformCode?: string | null;
  distance?: string;
  lat?: number;
  lon?: number;
}

export interface BusInfo {
  tripId: string;
  line: string;
  system: string;
  destination: string;
  direction: string;
  arrivalTime: string;
  arrivalDatetime: Date;
  status: string;
  /**
   * Text used for route color generation.
   * Uses route_id (unique identifier per route) for precise color differentiation.
   * Falls back to route_name if route_id is not available.
   */
  routeColorText?: string;
}

export interface JourneyStopData {
  id: string;
  name: string;
  type: "current" | "intermediate" | "destination";
  time: string; // For backward compatibility, typically arrival_time
  arrivalTime?: string;
  departureTime?: string;
  arrivalDatetime: Date;
  departureDatetime: Date;
  cost?: number;
  label?: string;
}

export interface BusWithJourney {
  busInfo: BusInfo;
  routeJourney: JourneyStopData[];
}

/**
 * View-model type for bus stop page
 */
export interface BusStopInfo {
  busStop: BusStop;
  busesWithJourneys: BusWithJourney[]; // Paired, pre-computed journeys
  bestBusIndex: number;
}

// Re-exported API types for internal use
export type {
  NearbyStop,
  NearbyStopsResponse,
  UpcomingBusEnriched as UpcomingBusEnrichedData,
  EnrichedTrip as EnrichedTripData,
  TripTimedStop as TripTimedStopData,
  StopNameList as StopNameListData,
  StopWithPlatform,
  RelatedPlatformsResponse,
} from "@/api/types.gen";
