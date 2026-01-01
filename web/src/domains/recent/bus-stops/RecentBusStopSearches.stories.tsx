import type { Meta, StoryObj } from "@storybook/react";

import { RecentBusStopSearches } from "./RecentBusStopSearches";
import { mockRecentBusStops } from "./mockData";

const meta: Meta<typeof RecentBusStopSearches> = {
  title: "Domains/Recent/BusStops/List",
  component: RecentBusStopSearches,
  parameters: {
    layout: "centered",
    chromatic: { disableSnapshot: true },
  },
  tags: ["autodocs"],
  argTypes: {
    onBusStopSelect: { action: "busStopSelected" },
    onViewMore: { action: "viewMoreClicked" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithRecentSearches: Story = {
  args: {
    recentBusStops: mockRecentBusStops,
    onBusStopSelect: (busStopId: string) => console.log("Selected:", busStopId),
    onViewMore: () => console.log("View more clicked"),
  },
};

export const EmptyState: Story = {
  args: {
    recentBusStops: [],
    onBusStopSelect: (busStopId: string) => console.log("Selected:", busStopId),
  },
};

export const WithLimit: Story = {
  args: {
    recentBusStops: mockRecentBusStops,
    limit: 2,
    onBusStopSelect: (busStopId: string) => console.log("Selected:", busStopId),
    onViewMore: () => console.log("View more clicked"),
  },
};
