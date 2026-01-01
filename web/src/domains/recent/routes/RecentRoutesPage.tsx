import { Clock } from "lucide-react";

import { TopNavigation } from "@/components/common";

import styles from "../RecentPage.module.css";
import type { RecentRouteSearch } from "../types";
import { RecentRouteSearches } from "./RecentRouteSearches";

interface RecentRoutesPageProps {
  recentRoutes: RecentRouteSearch[];
  onBack?: () => void;
  onRouteSelect?: (
    fromStopId: string,
    toStopId: string,
    fromStopName: string,
    toStopName: string
  ) => void;
}

export function RecentRoutesPage({
  recentRoutes,
  onBack,
  onRouteSelect,
}: RecentRoutesPageProps) {
  return (
    <div className={styles.page}>
      <TopNavigation
        icon={<Clock size={24} aria-hidden="true" />}
        title="行き方検索履歴"
        showBackButton
        onBack={onBack}
      />

      <div className={styles.content}>
        <div className={styles.stack}>
          <RecentRouteSearches
            recentRoutes={recentRoutes}
            onRouteSelect={onRouteSelect}
          />
        </div>
      </div>
    </div>
  );
}
