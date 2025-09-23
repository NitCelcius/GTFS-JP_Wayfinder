import { useState, useEffect } from "react";
import { TopNavigation } from "@/components/common/TopNavigation/TopNavigation";
import { BottomNavigation } from "@/components/common/BottomNavigation/BottomNavigation";
import { BusStopList } from "./internal/BusStopList";
import { SearchInput } from "./internal/SearchInput";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import mockBusStopsList from "@/mocks/busStops";

interface BusStopSearchPageProps {
  onNavigateToRoute?: () => void;
  onNavigateToRecent?: () => void;
  onNavigateToBusStopInfo?: (busStopId: string) => void;
}

// Use the centralized mock bus stops for the demo page
const mockNearestBusStop = mockBusStopsList[5]; // 東駅 as nearest
const mockSearchResults = mockBusStopsList.slice(0, 3);

export function BusStopSearchPage({
  onNavigateToRoute,
  onNavigateToRecent,
  onNavigateToBusStopInfo,
}: BusStopSearchPageProps) {
  const [isLoadingNearestBusStop, setIsLoadingNearestBusStop] = useState(true);

  // Simulate loading for nearest bus stop
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingNearestBusStop(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);
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

  return (
    <div className="bg-white min-h-screen w-full max-w-[var(--max-w-mobile)] mx-auto flex flex-col relative pb-[var(--size-container-md)]">
      <TopNavigation
        icon={<SearchLocationIcon />}
        title="バス停検索"
        showBackButton={false}
      />

      <div className="flex-1 flex flex-col px-[var(--size-spacing-lg)] overflow-auto">
        {/* Nearest Bus Stop Section */}
        <div className="pt-[var(--size-spacing-lg)]">
          <h3 className="text-[0.875rem] mb-[var(--size-spacing-sm)]">
            一番近くのバス停
          </h3>
          {isLoadingNearestBusStop ? (
            <div className="w-full bg-white border border-gray-200 rounded-[var(--radius-lg)] p-[var(--size-spacing-lg)] mb-[var(--size-spacing-md)] flex items-center justify-center">
              <div className="flex items-center gap-[var(--size-spacing-md)]">
                <LoadingSpinner size="sm" />
                <span className="text-[1rem] text-gray-600">読み込み中...</span>
              </div>
            </div>
          ) : (
            <BusStopList
              busStops={[mockNearestBusStop]}
              showHeader={false}
              onBusStopSelect={handleBusStopSelect}
            />
          )}
        </div>

        {/* Search Input */}
        <div className="pt-[var(--size-spacing-2xl)]">
          <SearchInput onSearch={handleSearch} />
        </div>

        {/* Search Results Section */}
        <div className="pt-[var(--size-spacing-2xl)] flex-1">
          <BusStopList
            busStops={mockSearchResults}
            showHeader={false}
            headerText="検索結果"
            onBusStopSelect={handleBusStopSelect}
          />
        </div>
      </div>

      <BottomNavigation
        activeTab="bus-stop"
        onTabClick={handleBottomNavClick}
      />
    </div>
  );
}
