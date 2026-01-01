import type { Meta, StoryObj } from "@storybook/react";

import { RecentRouteItem } from "./RecentRouteItem";
import { mockRecentRoutes } from "./mockData";

const meta: Meta<typeof RecentRouteItem> = {
  title: "Domains/Recent/Routes/Item",
  component: RecentRouteItem,
  parameters: {
    layout: "centered",
    chromatic: { disableSnapshot: true },
  },
  tags: ["autodocs"],
  argTypes: {
    onSelect: { action: "routeSelected" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    route: mockRecentRoutes[0],
    onSelect: (
      fromStopId: string,
      toStopId: string,
      fromStation: string,
      toStation: string
    ) => console.log("Selected:", fromStopId, toStopId, fromStation, toStation),
  },
};

export const LongStationNames: Story = {
  args: {
    route: mockRecentRoutes[2],
    onSelect: (
      fromStopId: string,
      toStopId: string,
      fromStation: string,
      toStation: string
    ) => console.log("Selected:", fromStopId, toStopId, fromStation, toStation),
  },
};
