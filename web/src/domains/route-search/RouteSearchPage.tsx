import { useState } from "react";

import { BottomNavigation } from "@/components/common/BottomNavigation/BottomNavigation";
import { RouteSearchButton } from "@/components/common/RouteSearchButton/RouteSearchButton";
import { TopNavigation } from "@/components/common/TopNavigation/TopNavigation";
import { MapSearchIcon } from "@/components/common/icons/MapSearchIcon";
import { useSearchHistory } from "@/hooks";

import { RouteInputs } from "./internal/RouteInputs";
import { SearchConditions } from "./internal/SearchConditions";

interface MainContentProps {
  onSearch?: (originValue: string, destinationValue: string) => void;
  originValue: string;
  destinationValue: string;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
}

function MainContent({
  onSearch,
  originValue,
  destinationValue,
  onOriginChange,
  onDestinationChange,
}: MainContentProps) {
  const isSearchEnabled = originValue.trim() && destinationValue.trim();

  const handleSearch = () => {
    if (isSearchEnabled) {
      onSearch?.(originValue, destinationValue);
    }
  };

  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[var(--size-spacing-xl)] grow items-center justify-center min-h-px min-w-px px-[var(--size-spacing-lg)] py-[var(--size-spacing-sm)] relative shrink-0 w-full">
      <RouteInputs
        originValue={originValue}
        destinationValue={destinationValue}
        onOriginChange={onOriginChange}
        onDestinationChange={onDestinationChange}
      />
      <SearchConditions />
      <RouteSearchButton onClick={handleSearch} disabled={!isSearchEnabled} />
    </div>
  );
}

interface RouteSearchPageProps {
  onSearch?: () => void;
  onNavigateToBusStop?: () => void;
  onNavigateToRecent?: () => void;
}

export function RouteSearchPage({
  onSearch,
  onNavigateToBusStop,
  onNavigateToRecent,
}: RouteSearchPageProps) {
  const [originValue, setOriginValue] = useState("");
  const [destinationValue, setDestinationValue] = useState("");
  const { addRouteSearch } = useSearchHistory();

  const handleSearch = async (origin: string, destination: string) => {
    try {
      // Save to search history
      await addRouteSearch(origin, destination);
    } catch (error) {
      console.error("Failed to save route search history:", error);
      // Continue with search even if history save fails
    }

    // Call the original search handler
    onSearch?.();
  };

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
    <div className="w-full max-w-[var(--max-w-mobile)] flex flex-col relative min-h-screen pb-[var(--size-container-md)] mx-auto">
      <TopNavigation icon={<MapSearchIcon />} title="経路探索" />
      <div className="flex-1 flex flex-col">
        <MainContent
          onSearch={handleSearch}
          originValue={originValue}
          destinationValue={destinationValue}
          onOriginChange={setOriginValue}
          onDestinationChange={setDestinationValue}
        />
      </div>
      <BottomNavigation activeTab="route" onTabClick={handleBottomNavClick} />
    </div>
  );
}
