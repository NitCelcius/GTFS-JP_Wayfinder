import type { Meta, StoryObj } from "@storybook/react";

import { RecentBusStopSearch } from "../types";
import { RecentBusStopSearches } from "./RecentBusStopSearches";

const meta: Meta<typeof RecentBusStopSearches> = {
  title: "Recent/Internal/RecentBusStopSearches",
  component: RecentBusStopSearches,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onBusStopSelect: { action: "busStopSelected" },
    onViewMore: { action: "viewMoreClicked" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleBusStops: RecentBusStopSearch[] = [
  {
    id: "1",
    name: "中央公園",
    searchedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "2",
    name: "東駅",
    searchedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: "3",
    name: "あきた芸術劇場ミルハス・にぎわい交流館 AU 前",
    searchedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
];

export const WithRecentSearches: Story = {
  args: {
    recentBusStops: sampleBusStops,
    onBusStopSelect: (busStopId: string) => console.log("Selected:", busStopId),
    onViewMore: () => console.log("View more clicked"),
  },
};

export const Empty: Story = {
  args: {
    recentBusStops: [],
    onBusStopSelect: (busStopId: string) => console.log("Selected:", busStopId),
    onViewMore: () => console.log("View more clicked"),
  },
};

export const SingleItem: Story = {
  args: {
    recentBusStops: [sampleBusStops[0]],
    onBusStopSelect: (busStopId: string) => console.log("Selected:", busStopId),
    onViewMore: () => console.log("View more clicked"),
  },
};
