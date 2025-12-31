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
}

function ClockIcon() {
  return <Clock size={24} aria-hidden="true" />;
}

export function RecentPage({
  onNavigateToRoute,
  onNavigateToBusStop,
  onNavigateToBusStopInfo,
  onNavigateToRouteSearch,
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

  const handleViewMoreBusStops = () =>
    console.log("Navigate to more bus stop search history");
  const handleViewMoreRoutes = () =>
    console.log("Navigate to more route search history");

  return (
    <div className={styles.page}>
      <TopNavigation icon={<ClockIcon />} title="履歴" />

      <div className={styles.content}>
        <div className={styles.stack}>
          <RecentBusStopSearches
            recentBusStops={busStopSearches}
            onBusStopSelect={handleBusStopSelect}
            onViewMore={handleViewMoreBusStops}
          />
          <RecentRouteSearches
            recentRoutes={routeSearches}
            onRouteSelect={handleRouteSelect}
            onViewMore={handleViewMoreRoutes}
          />
        </div>
      </div>

      <BottomNavigation activeTab="recent" onTabClick={handleBottomNavClick} />
    </div>
  );
}
