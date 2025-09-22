import { TopNavigation } from "../../common/TopNavigation/TopNavigation";
import { RouteInputs } from "./internal/RouteInputs";
import { SearchConditions } from "./internal/SearchConditions";
import { BottomNavigation } from "../../common/BottomNavigation/BottomNavigation";
import { MapSearchIcon } from "../../common/icons/MapSearchIcon";
import { RouteSearchButton } from "../../common/RouteSearchButton/RouteSearchButton";

interface MainContentProps {
  onSearch?: () => void;
}

function MainContent({ onSearch }: MainContentProps) {
  return (
    <div
      className="flex-1 min-h-0 box-border content-stretch flex flex-col gap-[var(--size-spacing-xl)] items-center justify-center px-[var(--size-spacing-lg)] py-[var(--size-spacing-sm)] w-full"
      data-name="Main"
    >
      <RouteInputs />
      <SearchConditions />
      <RouteSearchButton
        onClick={onSearch || (() => {})} // Use provided onSearch or placeholder
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
    <div
      className="bg-white min-h-screen w-full max-w-[var(--max-w-mobile)] mx-auto flex flex-col"
      data-name="RouteSearch"
    >
      <TopNavigation icon={<MapSearchIcon />} title="経路探索" />
      <MainContent onSearch={onSearch} />
      <BottomNavigation activeTab="route" onTabClick={handleBottomNavClick} />
    </div>
  );
}
