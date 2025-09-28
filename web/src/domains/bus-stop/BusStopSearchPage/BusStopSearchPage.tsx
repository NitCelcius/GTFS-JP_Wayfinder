import { useState } from "react";

import { BottomNavigation } from "@/components/common/BottomNavigation/BottomNavigation";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { TopNavigation } from "@/components/common/TopNavigation/TopNavigation";
import mockBusStopsList from "@/mocks/busStops";

import { useNearbyStops } from "../hooks/useNearbyStops";
import type { BusStop } from "../types";
import { BusStopList } from "./internal/BusStopList";
import { SearchInput } from "./internal/SearchInput";

interface BusStopSearchPageProps {
  onNavigateToRoute?: () => void;
  onNavigateToRecent?: () => void;
  onNavigateToBusStopInfo?: (busStopId: string) => void;
}

// Fallback bus stop (秋田駅東口) when location is unavailable
const fallbackNearestBusStop: BusStop = {
  id: "1021_01",
  name: "秋田駅東口",
  distance: "位置情報無効",
};

export function BusStopSearchPage({
  onNavigateToRoute,
  onNavigateToRecent,
  onNavigateToBusStopInfo,
}: BusStopSearchPageProps) {
  const [mockSearchResults] = useState(() => mockBusStopsList.slice(0, 3));
  const {
    nearbyStops,
    isLoading: isLoadingNearby,
    hasLocationPermission,
  } = useNearbyStops();
  const handleBottomNavClick = (
    tab: "bus-stop" | "route" | "recent" | "faq"
  ) => {
    switch (tab) {
      case "route":
        onNavigateToRoute?.();
        break;
      case "recent":
        onNavigateToRecent?.();
        break;
      case "faq":
        // FAQ is handled by the BottomNavigation component itself (external link)
        break;
      default:
        // Already on bus stop page
        break;
    }
  };

  const SearchLocationIcon = () => (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );

  const handleSearch = (query: string) => {
    // Placeholder for search functionality
    console.log("Searching for:", query);
  };

  const handleBusStopSelect = (busStopId: string) => {
    onNavigateToBusStopInfo?.(busStopId);
  };

  // Convert domain BusStop to component BusStop format
  const convertToComponentBusStop = (busStop: BusStop) => ({
    id: busStop.id,
    name: busStop.name,
    distance: busStop.distance || "",
    selectUrl: `/bus-stop/${busStop.id}`,
  });

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
  const componentSearchResults = hasLocationPermission ? [] : mockSearchResults;

  return (
    <div className="bg-white min-h-screen w-full max-w-[var(--max-w-mobile)] mx-auto flex flex-col relative pb-[var(--size-container-md)]">
      <TopNavigation
        icon={<SearchLocationIcon />}
        title="バス停検索"
        showBackButton={false}
      />

      <div className="flex-1 flex flex-col px-[var(--size-spacing-lg)] overflow-auto">
        {/* Search Input */}
        <div className="pt-[var(--size-spacing-lg)]">
          <SearchInput onSearch={handleSearch} />
        </div>

        {/* Nearest Bus Stop Section */}
        <div className="pt-[var(--size-spacing-2xl)]">
          <h3 className="text-[0.875rem] mb-[var(--size-spacing-sm)]">
            一番近くのバス停
          </h3>
          {isLoadingNearby ? (
            <div className="w-full bg-white border border-gray-200 rounded-[var(--radius-lg)] p-[var(--size-spacing-lg)] mb-[var(--size-spacing-md)] flex items-center justify-center">
              <div className="flex items-center gap-[var(--size-spacing-md)]">
                <LoadingSpinner size="sm" />
                <span className="text-[1rem] text-gray-600">読み込み中...</span>
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
          <div className="pt-[var(--size-spacing-2xl)] flex-1">
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
    </div>
  );
}
