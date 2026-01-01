import type { Meta, StoryObj } from "@storybook/react";

import { RecentRouteSearches } from "./RecentRouteSearches";
import { mockRecentRoutes } from "./mockData";

const meta: Meta<typeof RecentRouteSearches> = {
  title: "Domains/Recent/Routes/List",
  component: RecentRouteSearches,
  parameters: {
    layout: "centered",
    chromatic: { disableSnapshot: true },
  },
  tags: ["autodocs"],
  argTypes: {
    onRouteSelect: { action: "routeSelected" },
    onViewMore: { action: "viewMoreClicked" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithRecentSearches: Story = {
  args: {
    recentRoutes: mockRecentRoutes,
    onRouteSelect: (
      fromStopId: string,
      toStopId: string,
      fromStation: string,
      toStation: string
    ) => console.log("Selected:", fromStopId, toStopId, fromStation, toStation),
    onViewMore: () => console.log("View more clicked"),
  },
};

export const EmptyState: Story = {
  args: {
    recentRoutes: [],
    onRouteSelect: (
      fromStopId: string,
      toStopId: string,
      fromStation: string,
      toStation: string
    ) => console.log("Selected:", fromStopId, toStopId, fromStation, toStation),
  },
};

export const WithLimit: Story = {
  args: {
    recentRoutes: mockRecentRoutes,
    limit: 2,
    onRouteSelect: (
      fromStopId: string,
      toStopId: string,
      fromStation: string,
      toStation: string
    ) => console.log("Selected:", fromStopId, toStopId, fromStation, toStation),
    onViewMore: () => console.log("View more clicked"),
  },
};
