import { MapPin } from "lucide-react";

import { useState } from "react";

import {
  BottomNavigation,
  BusStopSearchModalContainer,
  LoadingSpinner,
  TopNavigation,
} from "@/components/common";
import type { BusStopSearchResult } from "@/types";

import type { BusStop } from "../types";
import styles from "./BusStopSearchPage.module.css";
import { BusStopList, BusStopListProps } from "./internal/BusStopList";
import { SearchInput } from "./internal/SearchInput";

interface BusStopSearchPageProps {
  nearbyStops: BusStop[];
  isLoadingNearby: boolean;
  hasLocationPermission: boolean;
  onNavigateToRoute?: () => void;
  onNavigateToRecent?: () => void;
  onNavigateToBusStopInfo?: (
    busStopId: string,
    name?: string,
    distance?: string
  ) => void;
}

// Fallback bus stop (秋田駅東口) when location is unavailable
const fallbackNearestBusStop: BusStop = {
  id: "1021 1",
  name: "秋田駅東口",
  distance: "位置情報無効",
};

export function BusStopSearchPage({
  nearbyStops,
  isLoadingNearby,
  hasLocationPermission,
  onNavigateToRoute,
  onNavigateToRecent,
  onNavigateToBusStopInfo,
}: BusStopSearchPageProps) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleBottomNavClick = (tab: "bus-stop" | "route" | "recent") => {
    switch (tab) {
      case "route":
        onNavigateToRoute?.();
        break;
      case "recent":
        onNavigateToRecent?.();
        break;
      default:
        // Already on bus stop page
        break;
    }
  };

  const SearchLocationIcon = () => <MapPin size={24} />;

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
  };

  const handleSearchModalSelect = (result: BusStopSearchResult) => {
    // Use the first candidate stop ID (consistent with route search behavior)
    const busStopId = result.candidate_stop_id_list[0];
    if (busStopId) {
      onNavigateToBusStopInfo?.(busStopId, result.stop_name);
      setIsSearchModalOpen(false);
    } else {
      console.error("No candidate stop IDs available for:", result.stop_name);
    }
  };

  // Store bus stop data for history tracking
  const busStopDataMap = new Map<string, { name: string; distance: string }>();

  const handleBusStopSelect = (busStopId: string) => {
    const busStopData = busStopDataMap.get(busStopId);
    onNavigateToBusStopInfo?.(
      busStopId,
      busStopData?.name,
      busStopData?.distance
    );
  };

  // Convert domain BusStop to component BusStop format
  const convertToComponentBusStop = (busStop: BusStop) => {
    // Store bus stop data for history tracking
    busStopDataMap.set(busStop.id, {
      name: busStop.name,
      distance: busStop.distance || "",
    });

    return {
      id: busStop.id,
      name: busStop.name,
      distance: busStop.distance || "",
      selectUrl: `/bus-stop/${busStop.id}`,
    };
  };

  // Prepare the nearby stops to display
  const nearbyStopsToDisplay =
    hasLocationPermission && nearbyStops.length > 0
      ? [...nearbyStops] // Show fetched stops
      : [fallbackNearestBusStop]; // Only show fallback when location is denied or no stops found

  const componentNearbyStops = nearbyStopsToDisplay.map(
    convertToComponentBusStop
  );
  // TODO: remove mock from here if possible
  // Show mock search results only when location permission is not granted
  const componentSearchResults: BusStopListProps["busStops"] = [];
  return (
    <div className={styles.page}>
      <TopNavigation
        icon={<SearchLocationIcon />}
        title="バス停検索"
        showBackButton={false}
      />

      <div className={styles.content}>
        {/* Search Input */}
        <div className={styles.searchSection}>
          <SearchInput onSearch={handleSearchClick} />
        </div>

        {/* Nearest Bus Stop Section */}
        <div className={styles.nearestSection}>
          <h3 className={styles.nearestTitle}>一番近くのバス停</h3>
          {isLoadingNearby ? (
            <div className={styles.loadingNearest}>
              <div className={styles.loadingRow}>
                <LoadingSpinner size="sm" />
                <span className={styles.loadingText}>読み込み中...</span>
              </div>
            </div>
          ) : (
            <BusStopList
              busStops={componentNearbyStops}
              showHeader={false}
              onBusStopSelect={handleBusStopSelect}
            />
          )}
        </div>

        {/* Search Results Section (mock data only shown when location is disabled) */}
        {componentSearchResults.length > 0 && (
          <div className={styles.searchResults}>
            <BusStopList
              busStops={componentSearchResults}
              showHeader={false}
              headerText="検索結果"
              onBusStopSelect={handleBusStopSelect}
            />
          </div>
        )}
      </div>

      <BottomNavigation
        activeTab="bus-stop"
        onTabClick={handleBottomNavClick}
      />

      {/* Bus Stop Search Modal */}
      <BusStopSearchModalContainer
        isOpen={isSearchModalOpen}
        onCanceled={() => setIsSearchModalOpen(false)}
        onSelected={handleSearchModalSelect}
        title="バス停を検索"
        placeholder="バス停名を入力してください"
      />
    </div>
  );
}
