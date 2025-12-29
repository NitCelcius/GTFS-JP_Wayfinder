import { useSearchParams } from "next/navigation";

import { ErrorBoundary } from "@/components/common";

import { SearchResultPage } from "./SearchResultPage";
import {
  EmptyState,
  LoadingState,
  NoRoutesFoundState,
} from "./internal/components";
import { useRouteSearch } from "./internal/hooks";

interface RouteSearchResultsContainerProps {
  onBack: () => void;
  onNavigateToBusStop: () => void;
  onNavigateToRecent: () => void;
}

/**
 * Container component that handles the entire route search results flow,
 * including loading states, error handling, and rendering the appropriate UI
 */
export function RouteSearchResultsContainer({
  onBack,
  onNavigateToBusStop,
  onNavigateToRecent,
}: RouteSearchResultsContainerProps) {
  const searchParams = useSearchParams();
  const { tripDetails, isLoading, error, handleRouteSelect } = useRouteSearch();

  // Construct the full search URL for sharing
  const searchUrl = searchParams.toString()
    ? `/results?${searchParams.toString()}`
    : undefined;

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorBoundary message={error} />;
  }

  // No trip details state
  if (!tripDetails) {
    return <EmptyState onBack={onBack} />;
  }

  // Check if we have routes
  const hasRoutes = tripDetails.routes && tripDetails.routes.length > 0;
  const isQuerySearch =
    searchParams.get("real") === "true" ||
    searchParams.get("search") === "true";
  const isResultLike = tripDetails !== null;

  // No routes found state
  if ((isQuerySearch || isResultLike) && !hasRoutes) {
    return <NoRoutesFoundState onBack={onBack} />;
  }

  // Success state with routes
  if (hasRoutes) {
    return (
      <SearchResultPage
        tripDetails={tripDetails}
        searchUrl={searchUrl}
        onRouteSelect={handleRouteSelect}
        onBack={onBack}
        onNavigateToBusStop={onNavigateToBusStop}
        onNavigateToRecent={onNavigateToRecent}
        isLoading={false}
      />
    );
  }

  // Fallback empty state
  return <NoRoutesFoundState onBack={onBack} />;
}
