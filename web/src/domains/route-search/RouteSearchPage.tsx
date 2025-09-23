import { useState } from "react";
import { TopNavigation } from "@/components/common/TopNavigation/TopNavigation";
import { RouteInputs } from "./internal/RouteInputs";
import { SearchConditions } from "./internal/SearchConditions";
import { BottomNavigation } from "@/components/common/BottomNavigation/BottomNavigation";
import { MapSearchIcon } from "@/components/common/icons/MapSearchIcon";
import { RouteSearchButton } from "@/components/common/RouteSearchButton/RouteSearchButton";

interface MainContentProps {
  onSearch?: () => void;
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
  onDestinationChange 
}: MainContentProps) {
  const isSearchDisabled = !originValue.trim() || !destinationValue.trim();

  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[var(--size-spacing-xl)] grow items-center justify-center min-h-px min-w-px px-[var(--size-spacing-lg)] py-[var(--size-spacing-sm)] relative shrink-0 w-full">
      <RouteInputs 
        originValue={originValue}
        destinationValue={destinationValue}
        onOriginChange={onOriginChange}
        onDestinationChange={onDestinationChange}
      />
      <SearchConditions />
      <RouteSearchButton 
        onClick={onSearch || (() => {})} 
        disabled={isSearchDisabled}
      />
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
          onSearch={onSearch} 
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
