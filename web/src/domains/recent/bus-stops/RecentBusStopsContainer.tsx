import { useBusStopSearchHistory } from "@/hooks/useSearchHistory";

import { RecentBusStopsPage } from "./RecentBusStopsPage";

interface RecentBusStopsContainerProps {
  onBack?: () => void;
  onNavigateToBusStopInfo?: (busStopId: string) => void;
}

export function RecentBusStopsContainer({
  onBack,
  onNavigateToBusStopInfo,
}: RecentBusStopsContainerProps) {
  const { searches: busStopSearches } = useBusStopSearchHistory();

  return (
    <RecentBusStopsPage
      recentBusStops={busStopSearches}
      onBack={onBack}
      onBusStopSelect={onNavigateToBusStopInfo}
    />
  );
}
