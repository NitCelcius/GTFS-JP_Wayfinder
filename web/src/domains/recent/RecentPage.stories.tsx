import type { Meta, StoryObj } from "@storybook/react";

import { RecentPage } from "./RecentPage";

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

export const Default: Story = {
  args: {
    onNavigateToRoute: () => console.log("Navigate to route"),
    onNavigateToBusStop: () => console.log("Navigate to bus stop"),
    onNavigateToBusStopInfo: (busStopId: string) =>
      console.log("Navigate to bus stop info:", busStopId),
    onNavigateToRouteSearch: (fromStation: string, toStation: string) =>
      console.log("Navigate to route search:", fromStation, "→", toStation),
  },
};
