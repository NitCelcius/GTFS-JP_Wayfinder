import type { Meta, StoryObj } from "@storybook/react";

import { StopItem } from "./StopItem";

const meta: Meta<typeof StopItem> = {
  title: "Domains/BusStop/Internal/StopItem",
  component: StopItem,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StopItem>;

export const RegularStop: Story = {
  args: {
    stop: {
      id: "stop1",
      name: "中央公園",
      arrivalTime: "14:25",
      fare: 125,
      isCurrent: false,
      isBusLocation: false,
      isDestination: false,
      isPassed: false,
    },
  },
};

export const CurrentStop: Story = {
  args: {
    stop: {
      id: "stop2",
      name: "市役所前",
      arrivalTime: "14:30",
      isCurrent: true,
      isBusLocation: false,
      isDestination: false,
      isPassed: false,
    },
  },
};

export const BusLocationStop: Story = {
  args: {
    stop: {
      id: "stop3",
      name: "青葉台",
      arrivalTime: "14:20",
      isCurrent: false,
      isBusLocation: true,
      isDestination: false,
      isPassed: false,
    },
  },
};

export const DestinationStop: Story = {
  args: {
    stop: {
      id: "stop4",
      name: "東駅",
      arrivalTime: "14:45",
      fare: 200,
      isCurrent: false,
      isBusLocation: false,
      isDestination: true,
      isPassed: false,
    },
  },
};

export const PassedStop: Story = {
  args: {
    stop: {
      id: "stop5",
      name: "西口",
      arrivalTime: "14:10",
      isCurrent: false,
      isBusLocation: false,
      isDestination: false,
      isPassed: true,
    },
  },
};

export const LongStopName: Story = {
  args: {
    stop: {
      id: "stop6",
      name: "あきた芸術劇場ミルハス・にぎわい交流館 AU 前",
      arrivalTime: "16:45",
      fare: 200,
      isCurrent: false,
      isBusLocation: false,
      isDestination: false,
      isPassed: false,
    },
  },
};
