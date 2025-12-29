import { BottomNavigation } from "@/components/common/BottomNavigation/BottomNavigation";
import { TopNavigation } from "@/components/common/TopNavigation/TopNavigation";

import { RouteOptionCard, SearchSummary } from "./internal";
import styles from "./RouteOverviewPage.module.css";
import type { RouteOverviewPageProps } from "./types";

export function RouteOverviewPage({
  routeData,
  onRouteSelect,
  onBack,
  onNavigateToBusStop,
  onNavigateToRecent,
}: RouteOverviewPageProps) {
  const handleBottomNavClick = (tab: "bus-stop" | "route" | "recent") => {
    switch (tab) {
      case "bus-stop":
        onNavigateToBusStop?.();
        break;
      case "recent":
        onNavigateToRecent?.();
        break;
      default:
        // Already on route page
        break;
    }
  };

  return (
    <div className={styles.page}>
      <TopNavigation
        title="経路を選択"
        showBackButton={true}
        onBack={onBack}
      />

      <div className={styles.scrollArea}>
        <div className={styles.content}>
          <SearchSummary
            fromStation={routeData.fromStation}
            toStation={routeData.toStation}
            searchDateTime={routeData.searchDateTime}
          />

          <div className={styles.routesSection}>
            <h2 className={styles.sectionTitle}>
              検索結果 ({routeData.routes.length}件)
            </h2>
            <div className={styles.routesList}>
              {routeData.routes.map((route) => (
                <RouteOptionCard
                  key={route.id}
                  route={route}
                  onSelect={() => onRouteSelect(route.tripId)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation activeTab="route" onTabClick={handleBottomNavClick} />
    </div>
  );
}
