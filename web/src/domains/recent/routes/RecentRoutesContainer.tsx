import { useRouteSearchHistory } from "@/hooks/useSearchHistory";

import { RecentRoutesPage } from "./RecentRoutesPage";

interface RecentRoutesContainerProps {
  onBack?: () => void;
  onNavigateToRouteSearch?: (
    fromStopId: string,
    toStopId: string,
    fromStopName: string,
    toStopName: string
  ) => void;
}

export function RecentRoutesContainer({
  onBack,
  onNavigateToRouteSearch,
}: RecentRoutesContainerProps) {
  const { searches: routeSearches } = useRouteSearchHistory();

  return (
    <RecentRoutesPage
      recentRoutes={routeSearches}
      onBack={onBack}
      onRouteSelect={onNavigateToRouteSearch}
    />
  );
}
