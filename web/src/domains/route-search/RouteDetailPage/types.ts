import type { RouteOption } from "../SearchResultPage/types";

// Re-export shared types from SearchResultPage to avoid duplication
// RouteOption and Station are identical in structure for both pages
export type { RouteOption as Route, Station } from "../SearchResultPage/types";

/**
 * Props for the RouteDetailPage component
 */
export interface RouteDetailPageProps {
  /** Route details to display */
  route: RouteOption;
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
