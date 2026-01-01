import { Clock } from "lucide-react";

import { BottomNavigation, TopNavigation } from "@/components/common";
import {
  useBusStopSearchHistory,
  useRouteSearchHistory,
} from "@/hooks/useSearchHistory";

import styles from "./RecentPage.module.css";
import { RecentBusStopSearches } from "./internal/RecentBusStopSearches";
import { RecentRouteSearches } from "./internal/RecentRouteSearches";

interface RecentPageProps {
  onNavigateToRoute?: () => void;
  onNavigateToBusStop?: () => void;
  onNavigateToBusStopInfo?: (busStopId: string) => void;
  onNavigateToRouteSearch?: (
    fromStopId: string,
    toStopId: string,
    fromStopName: string,
    toStopName: string
  ) => void;
  onViewMoreBusStops?: () => void;
  onViewMoreRoutes?: () => void;
}

export function RecentPage({
  onNavigateToRoute,
  onNavigateToBusStop,
  onNavigateToBusStopInfo,
  onNavigateToRouteSearch,
  onViewMoreBusStops,
  onViewMoreRoutes,
}: RecentPageProps) {
  const { searches: busStopSearches } = useBusStopSearchHistory();
  const { searches: routeSearches } = useRouteSearchHistory();

  const handleBottomNavClick = (tab: "bus-stop" | "route" | "recent") => {
    switch (tab) {
      case "bus-stop":
        onNavigateToBusStop?.();
        break;
      case "route":
        onNavigateToRoute?.();
        break;
      default:
        break;
    }
  };

  const handleBusStopSelect = (busStopId: string) => {
    onNavigateToBusStopInfo?.(busStopId);
  };

  const handleRouteSelect = (
    fromStopId: string,
    toStopId: string,
    fromStopName: string,
    toStopName: string
  ) => {
    onNavigateToRouteSearch?.(fromStopId, toStopId, fromStopName, toStopName);
  };

  const handleViewMoreBusStops = () => {
    onViewMoreBusStops?.();
  };

  const handleViewMoreRoutes = () => {
    onViewMoreRoutes?.();
  };

  return (
    <div className={styles.page}>
      <TopNavigation
        icon={<Clock size={24} aria-hidden="true" />}
        title="履歴"
      />

      <div className={styles.content}>
        <div className={styles.stack}>
          <RecentBusStopSearches
            recentBusStops={busStopSearches}
            onBusStopSelect={handleBusStopSelect}
            onViewMore={handleViewMoreBusStops}
            limit={3}
          />
          <RecentRouteSearches
            recentRoutes={routeSearches}
            onRouteSelect={handleRouteSelect}
            onViewMore={handleViewMoreRoutes}
            limit={3}
          />
        </div>
      </div>

      <BottomNavigation activeTab="recent" onTabClick={handleBottomNavClick} />
    </div>
  );
}
