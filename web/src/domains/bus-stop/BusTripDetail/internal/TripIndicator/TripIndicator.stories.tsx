import type { Meta, StoryObj } from "@storybook/react";

import { TripIndicator } from "./TripIndicator";

const meta: Meta<typeof TripIndicator> = {
  title: "Domains/BusStop/Internal/TripIndicator",
  component: TripIndicator,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TripIndicator>;

export const Default: Story = {
  args: {
    routeNumber: "001",
    routeName: "都心循環線",
    destinationName: "東駅",
    arrivalMinutes: 12,
    arrivalTime: "14:30",
    stopsAway: 2,
  },
};

export const LongRouteName: Story = {
  args: {
    routeNumber: "003",
    routeName: "文教医療線",
    destinationName: "あきた芸術劇場ミルハス・にぎわい交流館 AU 前",
    arrivalMinutes: 25,
    arrivalTime: "16:45",
    stopsAway: 3,
  },
};

export const ArrivingSoon: Story = {
  args: {
    routeNumber: "002",
    routeName: "青葉台線",
    destinationName: "緑が丘",
    arrivalMinutes: 2,
    arrivalTime: "15:05",
    stopsAway: 0,
  },
};

export const LongWait: Story = {
  args: {
    routeNumber: "004",
    routeName: "南北縦断線",
    destinationName: "大学病院",
    arrivalMinutes: 45,
    arrivalTime: "18:30",
    stopsAway: 8,
  },
};

export const PassedStop: Story = {
  args: {
    routeNumber: "001",
    routeName: "都心循環線",
    destinationName: "東駅",
    arrivalMinutes: 5,
    arrivalTime: "14:25",
    stopsAway: -2,
  },
};
