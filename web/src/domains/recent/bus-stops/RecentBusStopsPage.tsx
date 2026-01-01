import { Clock } from "lucide-react";

import { TopNavigation } from "@/components/common";

import styles from "../RecentPage.module.css";
import type { RecentBusStopSearch } from "../types";
import { RecentBusStopSearches } from "./RecentBusStopSearches";

interface RecentBusStopsPageProps {
  recentBusStops: RecentBusStopSearch[];
  onBack?: () => void;
  onBusStopSelect?: (busStopId: string) => void;
}

export function RecentBusStopsPage({
  recentBusStops,
  onBack,
  onBusStopSelect,
}: RecentBusStopsPageProps) {
  return (
    <div className={styles.page}>
      <TopNavigation
        icon={<Clock size={24} aria-hidden="true" />}
        title="バス停検索履歴"
        showBackButton
        onBack={onBack}
      />

      <div className={styles.content}>
        <div className={styles.stack}>
          <RecentBusStopSearches
            recentBusStops={recentBusStops}
            onBusStopSelect={onBusStopSelect}
          />
        </div>
      </div>
    </div>
  );
}
