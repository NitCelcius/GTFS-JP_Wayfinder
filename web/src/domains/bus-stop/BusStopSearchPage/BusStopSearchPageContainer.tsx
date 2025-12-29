import { useNearbyStops } from "../hooks/useNearbyStops";
import { BusStopSearchPage } from "./BusStopSearchPage";

interface BusStopSearchPageContainerProps {
  onNavigateToRoute?: () => void;
  onNavigateToRecent?: () => void;
  onNavigateToBusStopInfo?: (
    busStopId: string,
    name?: string,
    distance?: string
  ) => void;
}

/**
 * Container component that handles data fetching for BusStopSearchPage.
 * Uses the useNearbyStops hook to fetch nearby bus stops based on user location.
 */
export function BusStopSearchPageContainer({
  onNavigateToRoute,
  onNavigateToRecent,
  onNavigateToBusStopInfo,
}: BusStopSearchPageContainerProps) {
  const {
    nearbyStops,
    isLoading: isLoadingNearby,
    hasLocationPermission,
  } = useNearbyStops();

  return (
    <BusStopSearchPage
      nearbyStops={nearbyStops}
      isLoadingNearby={isLoadingNearby}
      hasLocationPermission={hasLocationPermission}
      onNavigateToRoute={onNavigateToRoute}
      onNavigateToRecent={onNavigateToRecent}
      onNavigateToBusStopInfo={onNavigateToBusStopInfo}
    />
  );
}
