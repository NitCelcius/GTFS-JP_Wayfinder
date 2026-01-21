import type { Meta, StoryObj } from "@storybook/react";

import type { RouteOption } from "../../SearchResultPage/types";
import { TripSummary } from "./TripSummary";

const meta: Meta<typeof TripSummary> = {
  title: "route-search/internal/TripSummary",
  component: TripSummary,
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof TripSummary>;

const baseRoute: RouteOption = {
  id: "route-1",
  name: "東駅 → 大学病院",
  departureTime: "08:15:00",
  arrivalTime: "09:00:00",
  duration: "45分",
  transferCount: 0,
  fare: 350,
  totalCost: 350,
  stations: [
    {
      stationName: "東駅",
      departureTime: "08:15:00",
      departureDatetime: new Date("2024-01-15T08:15:00"),
    },
    {
      stationName: "大学病院",
      arrivalTime: "09:00:00",
      arrivalDatetime: new Date("2024-01-15T09:00:00"),
      cost: 350,
    },
  ],
};

export const WithoutRelativeTime: Story = {
  args: {
    route: baseRoute,
  },
};

export const WithMultipleTransfers: Story = {
  args: {
    route: {
      ...baseRoute,
      relativeTimeUntilDeparture: "15分後にバス停発",
      transferCount: 2,
      totalCost: 700,
    },
  },
};
