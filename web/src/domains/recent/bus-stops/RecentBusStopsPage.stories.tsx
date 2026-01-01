import type { Meta, StoryObj } from "@storybook/react";

import type { RecentBusStopSearch } from "../types";
import { RecentBusStopsPage } from "./RecentBusStopsPage";

const meta = {
  title: "Domains/Recent/BusStops/Page",
  component: RecentBusStopsPage,
  parameters: {
    layout: "fullscreen",
    chromatic: { disableSnapshot: true },
  },
  args: {
    onBack: () => console.log("Back clicked"),
    onBusStopSelect: (busStopId: string) =>
      console.log("Navigate to bus stop:", busStopId),
  },
} satisfies Meta<typeof RecentBusStopsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockBusStopSearches: RecentBusStopSearch[] = [
  {
    recordId: "rec-1021_01",
    id: "1021_01",
    name: "秋田駅東口",
    distance: "120m",
    searchedAt: "2時間前",
  },
  {
    recordId: "rec-shiyakusho-mae",
    id: "shiyakusho-mae",
    name: "市役所前",
    distance: "300m",
    searchedAt: "昨日",
  },
  {
    recordId: "rec-aobadai",
    id: "aobadai",
    name: "青葉台",
    distance: "450m",
    searchedAt: "2日前",
  },
  {
    recordId: "rec-sakura-dori",
    id: "sakura-dori",
    name: "さくら通り",
    distance: "600m",
    searchedAt: "3日前",
  },
  {
    recordId: "rec-midori-ga-oka",
    id: "midori-ga-oka",
    name: "緑が丘",
    distance: "800m",
    searchedAt: "1週間前",
  },
];

export const Default: Story = {
  args: {
    recentBusStops: mockBusStopSearches,
  },
};

export const EmptyState: Story = {
  args: {
    recentBusStops: [],
  },
};
