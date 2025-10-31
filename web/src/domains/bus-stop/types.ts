// Domain types for bus stop functionality (without Data suffix for clarity)

export interface BusStop {
  id: string;
  name: string;
  distance?: string;
  lat?: number;
  lon?: number;
}

export interface BusInfo {
  line: string;
  system: string;
  destination: string;
  direction: string;
  arrivalTime: string;
  arrivalDatetime: Date;
  status: string;
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

export interface BusStopInfo {
  busStop: BusStop;
  nextBus?: BusInfo;
  routeJourney: JourneyStopData[];
}

// Re-exported API types for internal use
export type {
  NearbyStop,
  NearbyStopsResponse,
  UpcomingBusEnriched as UpcomingBusEnrichedData,
  EnrichedTrip as EnrichedTripData,
  TripTimedStop as TripTimedStopData,
  StopNameList as StopNameListData,
} from "@/api/types.gen";
