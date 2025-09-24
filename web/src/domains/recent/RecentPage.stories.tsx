import type { Meta, StoryObj } from "@storybook/react";

import React from "react";

import { BottomNavigation } from "@/components/common/BottomNavigation/BottomNavigation";
import { TopNavigation } from "@/components/common/TopNavigation/TopNavigation";

import { RecentPage } from "./RecentPage";
import { RecentBusStopSearches } from "./internal/RecentBusStopSearches";
import { RecentRouteSearches } from "./internal/RecentRouteSearches";
import { RecentBusStopSearch, RecentRouteSearch } from "./types";

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

const meta: Meta<typeof RecentPage> = {
  title: "Recent/RecentPage",
  component: RecentPage,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    onNavigateToRoute: { action: "navigateToRoute" },
    onNavigateToBusStop: { action: "navigateToBusStop" },
    onNavigateToBusStopInfo: { action: "navigateToBusStopInfo" },
    onNavigateToRouteSearch: { action: "navigateToRouteSearch" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for design purposes (preserved for Storybook)
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
    distance: "徒歩8分",
    searchedAt: "昨日 18:45",
  },
];

const mockRecentRoutes: RecentRouteSearch[] = [
  {
    id: "recent-route-1",
    fromStation: "東駅",
    toStation: "中央公園",
    searchedAt: "今日 15:30",
  },
  {
    id: "recent-route-2",
    fromStation: "市役所前",
    toStation: "青葉台",
    searchedAt: "今日 10:20",
  },
  {
    id: "recent-route-3",
    fromStation: "西口",
    toStation: "大学病院",
    searchedAt: "昨日 17:15",
  },
];

// Create a mock version of the component that bypasses the hook
const RecentPageWithMockData = (props: {
  onNavigateToRoute?: () => void;
  onNavigateToBusStop?: () => void;
  onNavigateToBusStopInfo?: (busStopId: string) => void;
  onNavigateToRouteSearch?: (fromStation: string, toStation: string) => void;
}) => {
  // Mock the useSearchHistory hook data
  const mockSearchHistory = {
    busStopSearches: mockRecentBusStops,
    routeSearches: mockRecentRoutes,
    error: null,
  };

  // Override the hook with mock data for Storybook
  React.useEffect(() => {
    // This is a Storybook-only override for design purposes
  }, []);

  return (
    <div className="w-full max-w-[var(--max-w-mobile)] flex flex-col relative min-h-screen pb-[var(--size-container-md)]">
      <TopNavigation icon={<ClockIcon />} title="最近" />

      <div className="flex-1 px-[var(--size-spacing-lg)] py-[var(--size-spacing-md)] overflow-y-auto">
        <div className="flex flex-col gap-[var(--size-spacing-2xl)]">
          <RecentBusStopSearches
            recentBusStops={mockSearchHistory.busStopSearches}
            onBusStopSelect={props.onNavigateToBusStopInfo}
            onViewMore={() =>
              console.log("Navigate to more bus stop search history")
            }
          />
          <RecentRouteSearches
            recentRoutes={mockSearchHistory.routeSearches}
            onRouteSelect={props.onNavigateToRouteSearch}
            onViewMore={() =>
              console.log("Navigate to more route search history")
            }
          />
        </div>
      </div>

      <BottomNavigation activeTab="recent" onTabClick={() => {}} />
    </div>
  );
};

export const WithMockData: Story = {
  render: (args) => <RecentPageWithMockData {...args} />,
  args: {
    onNavigateToRoute: () => console.log("Navigate to route"),
    onNavigateToBusStop: () => console.log("Navigate to bus stop"),
    onNavigateToBusStopInfo: (busStopId: string) =>
      console.log("Navigate to bus stop info:", busStopId),
    onNavigateToRouteSearch: (fromStation: string, toStation: string) =>
      console.log("Navigate to route search:", fromStation, "→", toStation),
  },
};

export const EmptyState: Story = {
  render: (args) => {
    const EmptyRecentPage = () => (
      <div className="w-full max-w-[var(--max-w-mobile)] flex flex-col relative min-h-screen pb-[var(--size-container-md)]">
        <TopNavigation icon={<ClockIcon />} title="最近" />

        <div className="flex-1 px-[var(--size-spacing-lg)] py-[var(--size-spacing-md)] overflow-y-auto">
          <div className="flex flex-col gap-[var(--size-spacing-2xl)]">
            <RecentBusStopSearches
              recentBusStops={[]}
              onBusStopSelect={args.onNavigateToBusStopInfo}
              onViewMore={() =>
                console.log("Navigate to more bus stop search history")
              }
            />
            <RecentRouteSearches
              recentRoutes={[]}
              onRouteSelect={args.onNavigateToRouteSearch}
              onViewMore={() =>
                console.log("Navigate to more route search history")
              }
            />
          </div>
        </div>

        <BottomNavigation activeTab="recent" onTabClick={() => {}} />
      </div>
    );
    return <EmptyRecentPage />;
  },
  args: {
    onNavigateToRoute: () => console.log("Navigate to route"),
    onNavigateToBusStop: () => console.log("Navigate to bus stop"),
    onNavigateToBusStopInfo: (busStopId: string) =>
      console.log("Navigate to bus stop info:", busStopId),
    onNavigateToRouteSearch: (fromStation: string, toStation: string) =>
      console.log("Navigate to route search:", fromStation, "→", toStation),
  },
};
