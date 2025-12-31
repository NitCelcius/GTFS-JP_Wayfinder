import type { Meta, StoryObj } from "@storybook/react";

import { Icon, TopNavigation } from "@/components/common";

import { AllRecentBusStopsPage } from "./AllRecentBusStopsPage";
import styles from "./RecentPage.module.css";
import { RecentBusStopSearches } from "./internal/RecentBusStopSearches";
import type { RecentBusStopSearch } from "./types";

const meta = {
  title: "Domains/Recent/AllRecentBusStopsPage",
  component: AllRecentBusStopsPage,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    onBack: () => console.log("Back clicked"),
    onNavigateToBusStopInfo: (busStopId: string) =>
      console.log("Navigate to bus stop:", busStopId),
  },
} satisfies Meta<typeof AllRecentBusStopsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for consistent visual regression testing
const mockBusStopSearches: RecentBusStopSearch[] = [
  {
    id: "1021_01",
    name: "秋田駅東口",
    distance: "120m",
    searchedAt: "2時間前",
  },
  {
    id: "shiyakusho-mae",
    name: "市役所前",
    distance: "300m",
    searchedAt: "昨日",
  },
  {
    id: "aobadai",
    name: "青葉台",
    distance: "450m",
    searchedAt: "2日前",
  },
  {
    id: "sakura-dori",
    name: "さくら通り",
    distance: "600m",
    searchedAt: "3日前",
  },
  {
    id: "midori-ga-oka",
    name: "緑が丘",
    distance: "800m",
    searchedAt: "1週間前",
  },
];

function ClockIcon() {
  return <Icon name="clock" size={24} aria-hidden="true" />;
}

// Default story - uses IndexedDB (disabled for chromatic VRT to avoid flakiness)
export const Default: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

// Story with fixed mock data for visual regression testing
export const WithMockData: Story = {
  render: (args) => {
    const handleBusStopSelect = (busStopId: string) => {
      args.onNavigateToBusStopInfo?.(busStopId);
    };

    return (
      <div className={styles.page}>
        <TopNavigation
          icon={<ClockIcon />}
          title="バス停検索履歴"
          showBackButton
          onBack={args.onBack}
        />

        <div className={styles.content}>
          <div className={styles.stack}>
            <RecentBusStopSearches
              recentBusStops={mockBusStopSearches}
              onBusStopSelect={handleBusStopSelect}
            />
          </div>
        </div>
      </div>
    );
  },
};

// Empty state for visual regression testing
export const EmptyState: Story = {
  render: (args) => {
    return (
      <div className={styles.page}>
        <TopNavigation
          icon={<ClockIcon />}
          title="バス停検索履歴"
          showBackButton
          onBack={args.onBack}
        />

        <div className={styles.content}>
          <div className={styles.stack}>
            <RecentBusStopSearches
              recentBusStops={[]}
              onBusStopSelect={args.onNavigateToBusStopInfo}
            />
          </div>
        </div>
      </div>
    );
  },
};
