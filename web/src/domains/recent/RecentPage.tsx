import { TopNavigation } from "@/components/common/TopNavigation/TopNavigation";
import { BottomNavigation } from "@/components/common/BottomNavigation/BottomNavigation";
import { RecentBusStopSearches } from "./internal/RecentBusStopSearches";
import { RecentRouteSearches } from "./internal/RecentRouteSearches";
import { RecentBusStopSearch, RecentRouteSearch } from "./types";

// Mock data for recent searches (using repository's mock station names)
const mockRecentBusStops: RecentBusStopSearch[] = [
  {
    id: "recent-bus-1",
    name: "中央公園",
    distance: "徒歩2分",
    searchedAt: "今日 14:30",
  },
  {
    id: "recent-bus-2",
    name: "市役所前",
    distance: "徒歩5分",
    searchedAt: "今日 12:15",
  },
  {
    id: "recent-bus-3",
    name: "東駅",
    distance: "徒歩3分",
    searchedAt: "昨日 18:45",
  },
];

const mockRecentRoutes: RecentRouteSearch[] = [
  {
    id: "recent-route-1",
    fromStation: "東駅",
    toStation: "中央公園",
    searchedAt: "今日 14:25",
  },
  {
    id: "recent-route-2",
    fromStation: "東駅",
    toStation: "緑が丘",
    searchedAt: "今日 11:30",
  },
  {
    id: "recent-route-3",
    fromStation: "西口",
    toStation: "大学病院",
    searchedAt: "昨日 19:20",
  },
  {
    id: "recent-route-4",
    fromStation: "さくら通り",
    toStation: "北高前",
    searchedAt: "昨日 16:40",
  },
  {
    id: "recent-route-5",
    fromStation: "緑が丘",
    toStation: "さくら通り",
    searchedAt: "2日前 13:15",
  },
];

interface RecentPageProps {
  onNavigateToRoute?: () => void;
  onNavigateToBusStop?: () => void;
  onNavigateToBusStopInfo?: (busStopId: string) => void;
  onNavigateToRouteSearch?: (fromStation: string, toStation: string) => void;
}

function ClockIcon() {
  return (
    <svg
      className="block size-full"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  );
}

export function RecentPage({
  onNavigateToRoute,
  onNavigateToBusStop,
  onNavigateToBusStopInfo,
  onNavigateToRouteSearch,
}: RecentPageProps) {
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

  const handleRouteSelect = (fromStation: string, toStation: string) => {
    onNavigateToRouteSearch?.(fromStation, toStation);
  };

  const handleViewMoreBusStops = () =>
    console.log("Navigate to more bus stop search history");
  const handleViewMoreRoutes = () =>
    console.log("Navigate to more route search history");

  return (
    <div className="w-full max-w-[var(--max-w-mobile)] flex flex-col relative min-h-screen  pb-[var(--size-container-md)]">
      <TopNavigation icon={<ClockIcon />} title="最近" />

      <div className="flex-1 px-[var(--size-spacing-lg)] py-[var(--size-spacing-md)] overflow-y-auto">
        <div className="flex flex-col gap-[var(--size-spacing-2xl)]">
          <RecentBusStopSearches
            recentBusStops={mockRecentBusStops}
            onBusStopSelect={handleBusStopSelect}
            onViewMore={handleViewMoreBusStops}
          />
          <RecentRouteSearches
            recentRoutes={mockRecentRoutes}
            onRouteSelect={handleRouteSelect}
            onViewMore={handleViewMoreRoutes}
          />
        </div>
      </div>

      <BottomNavigation activeTab="recent" onTabClick={handleBottomNavClick} />
    </div>
  );
}
