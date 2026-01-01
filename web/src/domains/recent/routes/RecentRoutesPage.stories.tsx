import type { Meta, StoryObj } from "@storybook/react";

import type { RecentRouteSearch } from "../types";
import { RecentRoutesPage } from "./RecentRoutesPage";

const meta = {
  title: "Domains/Recent/Routes/Page",
  component: RecentRoutesPage,
  parameters: {
    layout: "fullscreen",
    chromatic: { disableSnapshot: true },
  },
  args: {
    onBack: () => console.log("Back clicked"),
    onRouteSelect: (
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
} satisfies Meta<typeof RecentRoutesPage>;

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

export const Default: Story = {
  args: {
    recentRoutes: mockRouteSearches,
  },
};

export const EmptyState: Story = {
  args: {
    recentRoutes: [],
  },
};
