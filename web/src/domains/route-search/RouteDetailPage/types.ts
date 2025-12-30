/**
 * Represents a station/stop in the route
 */
export interface Station {
  /** Name of the station */
  stationName: string;
  /** Arrival time in HH:MM format (undefined for origin) */
  arrivalTime?: string;
  /** Departure time in HH:MM format (undefined for destination) */
  departureTime?: string;
  /** Arrival datetime object (when arrivalTime is present) */
  arrivalDatetime?: Date;
  /** Departure datetime object (when departureTime is present) */
  departureDatetime?: Date;
  /** Whether this is a transfer point */
  isTransfer?: boolean;
  /** Cost/fare to this station */
  cost?: number;
}

/**
 * Represents a single route option with detailed station information
 */
export interface Route {
  /** Unique route identifier */
  id: string;
  /** Route name/label */
  name: string;
  /** Departure time from origin in HH:MM format */
  departureTime: string;
  /** Arrival time at destination in HH:MM format */
  arrivalTime: string;
  /** Human-readable duration string */
  duration: string;
  /** Number of transfers in this route */
  transferCount: number;
  /** Base fare (optional) */
  fare?: number;
  /** Total cost including all charges */
  totalCost?: number;
  /** List of stations in this route */
  stations: Station[];
}

/**
 * Props for the RouteDetailPage component
 */
export interface RouteDetailPageProps {
  /** Route details to display */
  route: Route;
  /** Origin station name */
  fromStation: string;
  /** Destination station name */
  toStation: string;
  /** Callback when user navigates back */
  onBack: () => void;
  /** Optional callback to navigate to bus stop search page */
  onNavigateToBusStop?: () => void;
  /** Optional callback to navigate to recent searches page */
  onNavigateToRecent?: () => void;
  /** Whether to show costs in the timeline (default: true) */
  showCosts?: boolean;
}
