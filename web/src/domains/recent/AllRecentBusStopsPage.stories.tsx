import type { Meta, StoryObj } from "@storybook/react";

import { AllRecentBusStopsPage } from "./AllRecentBusStopsPage";

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

// Default story - shows all bus stop searches
export const Default: Story = {};
