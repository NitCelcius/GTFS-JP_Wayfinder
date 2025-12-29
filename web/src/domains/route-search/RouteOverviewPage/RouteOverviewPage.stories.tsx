import type { Meta, StoryObj } from "@storybook/react";

import { RouteOverviewPage } from "./RouteOverviewPage";
import type { RouteOverviewData } from "./types";

const mockRouteData: RouteOverviewData = {
  fromStation: "東駅",
  toStation: "大学病院",
  searchDateTime: "08:00",
  routes: [
    {
      id: "route-1",
      departureTime: "08:00",
      arrivalTime: "08:12",
      duration: "12分",
      fare: 150,
      tripId: "trip_001_001",
    },
    {
      id: "route-2",
      departureTime: "08:05",
      arrivalTime: "08:30",
      duration: "25分",
      fare: 200,
      tripId: "trip_002_001",
    },
    {
      id: "route-3",
      departureTime: "07:55",
      arrivalTime: "08:12",
      duration: "17分",
      fare: 180,
      tripId: "trip_003_001",
    },
  ],
};

const meta = {
  title: "Domains/RouteSearch/RouteOverviewPage",
  component: RouteOverviewPage,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    routeData: mockRouteData,
    onRouteSelect: (tripId: string) => console.log("Route selected:", tripId),
    onBack: () => console.log("Back clicked"),
    onNavigateToBusStop: () => console.log("Navigate to bus stop"),
    onNavigateToRecent: () => console.log("Navigate to recent"),
  },
} satisfies Meta<typeof RouteOverviewPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view with multiple route options
 */
export const Default: Story = {};

/**
 * Single route option
 */
export const SingleRoute: Story = {
  args: {
    routeData: {
      ...mockRouteData,
      routes: [mockRouteData.routes[0]],
    },
  },
};
