import type { Meta, StoryObj } from "@storybook/react";

import { RecentBusStopItem } from "./RecentBusStopItem";
import { mockRecentBusStops } from "./mockData";

const meta: Meta<typeof RecentBusStopItem> = {
  title: "Domains/Recent/BusStops/Item",
  component: RecentBusStopItem,
  parameters: {
    layout: "centered",
    chromatic: { disableSnapshot: true },
  },
  tags: ["autodocs"],
  argTypes: {
    onSelect: { action: "busStopSelected" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    busStop: mockRecentBusStops[0],
    onSelect: (id: string) => console.log("Selected:", id),
  },
};

export const LongName: Story = {
  args: {
    busStop: mockRecentBusStops[2],
    onSelect: (id: string) => console.log("Selected:", id),
  },
};

export const NoDistance: Story = {
  args: {
    busStop: mockRecentBusStops[3],
    onSelect: (id: string) => console.log("Selected:", id),
  },
};
