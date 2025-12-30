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
      transfers: 0,
      tripId: "trip_001_001",
      originStation: "東駅",
      destinationStation: "大学病院",
      relativeTimeUntilDeparture: "3分後にバス停発",
    },
    {
      id: "route-2",
      departureTime: "08:05",
      arrivalTime: "08:30",
      duration: "25分",
      fare: 200,
      transfers: 1,
      tripId: "trip_002_001",
      originStation: "東駅",
      destinationStation: "大学病院",
      relativeTimeUntilDeparture: "8分後にバス停発",
    },
    {
      id: "route-3",
      departureTime: "07:55",
      arrivalTime: "08:12",
      duration: "17分",
      fare: 180,
      transfers: 0,
      tripId: "trip_003_001",
      originStation: "東駅",
      destinationStation: "大学病院",
      relativeTimeUntilDeparture: "2分前に出発済み",
    },
  ],
};

const meta = {
  title: "Domains/RouteSearch/RouteOverviewPage",
  component: RouteOverviewPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Overview page displaying multiple route options from a search result. Shows route cards with time, duration, fare, and visual comparison of trip lengths via proportional progress bars. Allows users to select a specific route to view detailed journey information. Relative departure times are pre-calculated in the container to avoid time-based re-renders in the presentational component.",
      },
    },
  },
  tags: ["autodocs"],
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
 * Default view with multiple route options.
 * Note: Relative times are pre-calculated in the container and passed as props.
 * Progress bars are proportional to the relative duration of each route.
 */
export const Default: Story = {};

/**
 * Single route option - shows minimal list with one result
 */
export const SingleRoute: Story = {
  args: {
    routeData: {
      ...mockRouteData,
      routes: [mockRouteData.routes[0]],
    },
  },
};
