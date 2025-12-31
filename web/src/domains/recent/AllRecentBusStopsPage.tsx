import { Icon, TopNavigation } from "@/components/common";
import { useBusStopSearchHistory } from "@/hooks/useSearchHistory";

import styles from "./RecentPage.module.css";
import { RecentBusStopSearches } from "./internal/RecentBusStopSearches";

interface AllRecentBusStopsPageProps {
  onBack?: () => void;
  onNavigateToBusStopInfo?: (busStopId: string) => void;
}

function ClockIcon() {
  return <Icon name="clock" size={24} aria-hidden="true" />;
}

export function AllRecentBusStopsPage({
  onBack,
  onNavigateToBusStopInfo,
}: AllRecentBusStopsPageProps) {
  const { searches: busStopSearches } = useBusStopSearchHistory();

  const handleBusStopSelect = (busStopId: string) => {
    onNavigateToBusStopInfo?.(busStopId);
  };

  return (
    <div className={styles.page}>
      <TopNavigation
        icon={<ClockIcon />}
        title="バス停検索履歴"
        showBackButton
        onBack={onBack}
      />

      <div className={styles.content}>
        <div className={styles.stack}>
          <RecentBusStopSearches
            recentBusStops={busStopSearches}
            onBusStopSelect={handleBusStopSelect}
          />
        </div>
      </div>
    </div>
  );
}
