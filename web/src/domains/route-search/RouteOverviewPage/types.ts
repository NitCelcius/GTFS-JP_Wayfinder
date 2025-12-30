/**
 * Represents a single route option from search results
 */
export interface RouteOption {
  /** Unique identifier for the route option */
  id: string;
  /** Departure time in HH:MM format */
  departureTime: string;
  /** Arrival time in HH:MM format */
  arrivalTime: string;
  /** Human-readable duration string (e.g., "15分" or "1時間20分") */
  duration: string;
  /** Fare in yen (optional, may be undefined if not available) */
  fare?: number;
  /** Number of transfers required for this route */
  transfers: number;
  /** Trip ID used to fetch detailed journey information */
  tripId: string;
  /** Name of the origin station */
  originStation: string;
  /** Name of the destination station */
  destinationStation: string;
  /** Relative time description (e.g., "5分後にバス停発", "出発済み") */
  relativeTimeUntilDeparture: string;
}

/**
 * Data structure containing route search results for display
 */
export interface RouteOverviewData {
  /** Origin station name */
  fromStation: string;
  /** Destination station name */
  toStation: string;
  /** Search date/time display string */
  searchDateTime: string;
  /** List of available route options */
  routes: RouteOption[];
}

/**
 * Props for the RouteOverviewPage component
 */
export interface RouteOverviewPageProps {
  /** Route data to display including all available options */
  routeData: RouteOverviewData;
  /** Callback when user selects a route, receives the trip ID */
  onRouteSelect: (tripId: string) => void;
  /** Callback when user navigates back */
  onBack: () => void;
  /** Optional callback to navigate to bus stop search page */
  onNavigateToBusStop?: () => void;
  /** Optional callback to navigate to recent searches page */
  onNavigateToRecent?: () => void;
}
