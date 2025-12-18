import type { Meta, StoryObj } from "@storybook/react";

import { StopsList } from "./StopsList";

const meta: Meta<typeof StopsList> = {
  title: "Domains/BusStop/Internal/StopsList",
  component: StopsList,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StopsList>;

export const Default: Story = {
  args: {
    stops: [
      {
        id: "stop1",
        name: "西口",
        arrivalTime: "14:15",
        isCurrent: false,
        isBusLocation: false,
        isDestination: false,
        isPassed: true,
      },
      {
        id: "stop2",
        name: "青葉台",
        arrivalTime: "14:20",
        isCurrent: false,
        isBusLocation: true,
        isDestination: false,
        isPassed: false,
      },
      {
        id: "stop3",
        name: "中央公園",
        arrivalTime: "14:25",
        fare: 125,
        isCurrent: false,
        isBusLocation: false,
        isDestination: false,
        isPassed: false,
      },
      {
        id: "stop4",
        name: "市役所前",
        arrivalTime: "14:30",
        isCurrent: true,
        isBusLocation: false,
        isDestination: false,
        isPassed: false,
      },
      {
        id: "stop5",
        name: "東駅",
        arrivalTime: "14:45",
        fare: 200,
        isCurrent: false,
        isBusLocation: false,
        isDestination: true,
        isPassed: false,
      },
    ],
  },
};

export const ManyStops: Story = {
  args: {
    stops: [
      {
        id: "stop1",
        name: "西口",
        arrivalTime: "14:00",
        isCurrent: false,
        isBusLocation: false,
        isDestination: false,
        isPassed: true,
      },
      {
        id: "stop2",
        name: "南町",
        arrivalTime: "14:05",
        isCurrent: false,
        isBusLocation: false,
        isDestination: false,
        isPassed: true,
      },
      {
        id: "stop3",
        name: "北高前",
        arrivalTime: "14:10",
        fare: 100,
        isCurrent: false,
        isBusLocation: true,
        isDestination: false,
        isPassed: false,
      },
      {
        id: "stop4",
        name: "大学病院",
        arrivalTime: "14:15",
        fare: 125,
        isCurrent: false,
        isBusLocation: false,
        isDestination: false,
        isPassed: false,
      },
      {
        id: "stop5",
        name: "さくら通り",
        arrivalTime: "14:20",
        fare: 150,
        isCurrent: false,
        isBusLocation: false,
        isDestination: false,
        isPassed: false,
      },
      {
        id: "stop6",
        name: "緑が丘",
        arrivalTime: "14:25",
        fare: 175,
        isCurrent: false,
        isBusLocation: false,
        isDestination: false,
        isPassed: false,
      },
      {
        id: "stop7",
        name: "青葉台",
        arrivalTime: "14:30",
        fare: 200,
        isCurrent: false,
        isBusLocation: false,
        isDestination: false,
        isPassed: false,
      },
      {
        id: "stop8",
        name: "中央公園",
        arrivalTime: "14:35",
        fare: 225,
        isCurrent: true,
        isBusLocation: false,
        isDestination: false,
        isPassed: false,
      },
      {
        id: "stop9",
        name: "市役所前",
        arrivalTime: "14:40",
        fare: 250,
        isCurrent: false,
        isBusLocation: false,
        isDestination: false,
        isPassed: false,
      },
      {
        id: "stop10",
        name: "東駅",
        arrivalTime: "14:45",
        fare: 275,
        isCurrent: false,
        isBusLocation: false,
        isDestination: true,
        isPassed: false,
      },
    ],
  },
};

export const ShortTrip: Story = {
  args: {
    stops: [
      {
        id: "stop1",
        name: "緑が丘",
        arrivalTime: "17:10",
        isCurrent: false,
        isBusLocation: true,
        isDestination: false,
        isPassed: false,
      },
      {
        id: "stop2",
        name: "市役所前",
        arrivalTime: "17:12",
        isCurrent: true,
        isBusLocation: false,
        isDestination: false,
        isPassed: false,
      },
      {
        id: "stop3",
        name: "あきた芸術劇場ミルハス・にぎわい交流館 AU 前",
        arrivalTime: "17:15",
        fare: 100,
        isCurrent: false,
        isBusLocation: false,
        isDestination: true,
        isPassed: false,
      },
    ],
  },
};
