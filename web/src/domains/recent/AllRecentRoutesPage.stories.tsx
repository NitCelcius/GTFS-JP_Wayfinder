import type { Meta, StoryObj } from "@storybook/react";

import { Icon, TopNavigation } from "@/components/common";

import { AllRecentRoutesPage } from "./AllRecentRoutesPage";
import styles from "./RecentPage.module.css";
import { RecentRouteSearches } from "./internal/RecentRouteSearches";
import type { RecentRouteSearch } from "./types";

const meta = {
  title: "Domains/Recent/AllRecentRoutesPage",
  component: AllRecentRoutesPage,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    onBack: () => console.log("Back clicked"),
    onNavigateToRouteSearch: (
      fromStopId: string,
      toStopId: string,
      fromStopName: string,
      toStopName: string
    ) =>
      console.log(
        "Navigate to route search:",
        fromStopId,
        toStopId,
        fromStopName,
        toStopName
      ),
  },
} satisfies Meta<typeof AllRecentRoutesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for consistent visual regression testing
const mockRouteSearches: RecentRouteSearch[] = [
  {
    id: "1",
    fromStopId: "1021_01",
    toStopId: "shiyakusho-mae",
    fromStopName: "秋田駅東口",
    toStopName: "市役所前",
    searchedAt: "2時間前",
  },
  {
    id: "2",
    fromStopId: "aobadai",
    toStopId: "sakura-dori",
    fromStopName: "青葉台",
    toStopName: "さくら通り",
    searchedAt: "昨日",
  },
  {
    id: "3",
    fromStopId: "midori-ga-oka",
    toStopId: "1021_01",
    fromStopName: "緑が丘",
    toStopName: "秋田駅東口",
    searchedAt: "2日前",
  },
  {
    id: "4",
    fromStopId: "sakura-dori",
    toStopId: "aobadai",
    fromStopName: "さくら通り",
    toStopName: "青葉台",
    searchedAt: "3日前",
  },
  {
    id: "5",
    fromStopId: "shiyakusho-mae",
    toStopId: "midori-ga-oka",
    fromStopName: "市役所前",
    toStopName: "緑が丘",
    searchedAt: "1週間前",
  },
];

// Default story - uses IndexedDB (disabled for chromatic VRT to avoid flakiness)
export const Default: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export const WithMockData: Story = {
  render: (args) => {
    const handleRouteSelect = (
      fromStopId: string,
      toStopId: string,
      fromStopName: string,
      toStopName: string
    ) => {
      args.onNavigateToRouteSearch?.(
        fromStopId,
        toStopId,
        fromStopName,
        toStopName
      );
    };

    return (
      <div className={styles.page}>
        <TopNavigation
          icon={<Icon name="clock" size={24} aria-hidden="true" />}
          title="行き方検索履歴"
          showBackButton
          onBack={args.onBack}
        />

        <div className={styles.content}>
          <div className={styles.stack}>
            <RecentRouteSearches
              recentRoutes={mockRouteSearches}
              onRouteSelect={handleRouteSelect}
            />
          </div>
        </div>
      </div>
    );
  },
};

export const EmptyState: Story = {
  render: (args) => {
    return (
      <div className={styles.page}>
        <TopNavigation
          icon={<Icon name="clock" size={24} aria-hidden="true" />}
          title="行き方検索履歴"
          showBackButton
          onBack={args.onBack}
        />

        <div className={styles.content}>
          <div className={styles.stack}>
            <RecentRouteSearches
              recentRoutes={[]}
              onRouteSelect={args.onNavigateToRouteSearch}
            />
          </div>
        </div>
      </div>
    );
  },
};
