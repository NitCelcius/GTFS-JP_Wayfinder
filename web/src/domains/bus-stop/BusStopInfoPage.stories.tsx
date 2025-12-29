import type { Meta, StoryObj } from "@storybook/react";

import { BusStopInfoPage } from "./BusStopInfoPage";

const meta = {
  title: "Domains/BusStop/BusStopInfoPage",
  component: BusStopInfoPage,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["!autodocs", "!dev"], // Exclude from Storybook and Chromatic - component is deprecated
  args: {
    busStopId: "1021_01",
  },
} satisfies Meta<typeof BusStopInfoPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story - shows real API integration
export const Default: Story = {};

// Loading state story
export const Loading: Story = {
  args: {
    busStopId: undefined, // This will show loading state
  },
};

// Empty result story
export const NoData: Story = {
  args: {
    busStopId: "nonexistent_stop",
  },
};

// Interactive handlers story
export const InteractiveHandlers: Story = {
  args: {
    onBack: () => console.log("Back clicked"),
    onNavigateToRoute: () => console.log("Navigate to route"),
    onNavigateToRecent: () => console.log("Navigate to recent"),
  },
};

// Mock data for reference (moved from component)
export const mockBusStopData = {
  name: "上ノ橋駅",
  distance: "約10m",
  nextBus: {
    line: "篠山線",
    system: "系統400",
    destination: "篠山駅前",
    direction: "行",
    arrivalTime: "13:05",
    status: "当バス停着",
  },
  routeJourney: [
    {
      id: "stop1",
      name: "上ノ橋駅",
      type: "current" as const,
      time: "13:05",
      label: "現在地",
    },
    {
      id: "stop2",
      name: "一本杉",
      type: "intermediate" as const,
      time: "13:12",
      cost: 140,
    },
    {
      id: "stop3",
      name: "篠山駅前",
      type: "destination" as const,
      time: "13:18",
      cost: 180,
    },
  ],
};
