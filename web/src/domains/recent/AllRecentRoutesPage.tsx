import { Icon, TopNavigation } from "@/components/common";
import {
  useRouteSearchHistory,
} from "@/hooks/useSearchHistory";

import styles from "./RecentPage.module.css";
import { RecentRouteSearches } from "./internal/RecentRouteSearches";

interface AllRecentRoutesPageProps {
  onBack?: () => void;
  onNavigateToRouteSearch?: (
    fromStopId: string,
    toStopId: string,
    fromStopName: string,
    toStopName: string
  ) => void;
}

function ClockIcon() {
  return <Icon name="clock" size={24} aria-hidden="true" />;
}

export function AllRecentRoutesPage({
  onBack,
  onNavigateToRouteSearch,
}: AllRecentRoutesPageProps) {
  const { searches: routeSearches } = useRouteSearchHistory();

  const handleRouteSelect = (
    fromStopId: string,
    toStopId: string,
    fromStopName: string,
    toStopName: string
  ) => {
    onNavigateToRouteSearch?.(fromStopId, toStopId, fromStopName, toStopName);
  };

  return (
    <div className={styles.page}>
      <TopNavigation
        icon={<ClockIcon />}
        title="行き方検索履歴"
        showBackButton
        onBack={onBack}
      />

      <div className={styles.content}>
        <div className={styles.stack}>
          <RecentRouteSearches
            recentRoutes={routeSearches}
            onRouteSelect={handleRouteSelect}
          />
        </div>
      </div>
    </div>
  );
}
