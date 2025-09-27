// Domain types for bus stop functionality (without Data suffix for clarity)

export interface BusStop {
  id: string;
  name: string;
  distance?: string;
}

export interface BusInfo {
  line: string;
  system: string;
  destination: string;
  direction: string;
  arrivalTime: string;
  status: string;
}

export interface JourneyStop {
  id: string;
  name: string;
  type: "current" | "intermediate" | "destination";
  time: string; // For backward compatibility, typically arrival_time
  arrivalTime?: string;
  departureTime?: string;
  cost?: number;
  label?: string;
}

export interface BusStopInfo {
  busStop: BusStop;
  nextBus?: BusInfo;
  routeJourney: JourneyStop[];
}

// Re-exported API types for internal use
export type {
  UpcomingBusEnriched as UpcomingBusEnrichedData,
  EnrichedTrip as EnrichedTripData,
  TripTimedStop as TripTimedStopData,
  StopNameList as StopNameListData,
} from "@/api/types.gen";
