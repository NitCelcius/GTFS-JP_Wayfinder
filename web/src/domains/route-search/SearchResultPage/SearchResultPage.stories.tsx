import type { Meta, StoryObj } from "@storybook/react";

import { SearchResultPage } from "./SearchResultPage";
import { TripDetails } from "./types";

const meta = {
  title: "Domains/RouteSearch/SearchResultPage",
  component: SearchResultPage,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    onRouteSelect: (routeId: string) => console.log("Route selected:", routeId),
    onBack: () => console.log("Back clicked"),
    onNavigateToBusStop: () => console.log("Navigate to bus stop"),
    onNavigateToRecent: () => console.log("Navigate to recent"),
  },
} satisfies Meta<typeof SearchResultPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const createMockTripDetails = (routeCount: number): TripDetails => {
  const routes = Array.from({ length: routeCount }, (_, index) => ({
    id: `route-${index + 1}`,
    name: `経路 ${index + 1}`,
    departureTime: `08:${String(index * 5).padStart(2, "0")}`,
    arrivalTime: `08:${String(15 + index * 5).padStart(2, "0")}`,
    duration: `${15 + index}分`,
    transferCount: index % 2,
    fare: 150 + index * 50,
    totalCost: 150 + index * 50,
    stations: [
      {
        stationName: "東駅",
        departureTime: `08:${String(index * 5).padStart(2, "0")}`,
        departureDatetime: new Date(
          `2021-01-01T08:${String(index * 5).padStart(2, "0")}:00`
        ),
      },
      {
        stationName: "大学病院",
        arrivalTime: `08:${String(15 + index * 5).padStart(2, "0")}`,
        arrivalDatetime: new Date(
          `2021-01-01T08:${String(15 + index * 5).padStart(2, "0")}:00`
        ),
        cost: 150 + index * 50,
      },
    ],
  }));

  return {
    fromStation: "東駅",
    toStation: "大学病院",
    searchDateTime: "2021-01-01T08:00",
    selectedRouteId: routes[0].id,
    routes,
  };
};

/**
 * Single route result - The route tabs should NOT be displayed
 */
export const SingleRoute: Story = {
  args: {
    tripDetails: createMockTripDetails(1),
    searchUrl:
      "http://localhost:3000/route-search?from=higashi-eki&to=daigaku-byoin&time=08:00",
  },
  parameters: {
    docs: {
      description: {
        story:
          'When there is only one route result, the route tabs (showing "経路 1") are not displayed. This reduces visual clutter when there are no alternative routes to choose from.',
      },
    },
  },
};

/**
 * Multiple route results - Route tabs ARE displayed
 */
export const MultipleRoutes: Story = {
  args: {
    tripDetails: createMockTripDetails(3),
    searchUrl:
      "http://localhost:3000/route-search?from=higashi-eki&to=daigaku-byoin&time=08:00",
  },
  parameters: {
    docs: {
      description: {
        story:
          "When there are multiple route results, the route tabs are displayed to allow users to switch between different route options.",
      },
    },
  },
};

/**
 * Two routes - Route tabs ARE displayed
 */
export const TwoRoutes: Story = {
  args: {
    tripDetails: createMockTripDetails(2),
    searchUrl:
      "http://localhost:3000/route-search?from=higashi-eki&to=daigaku-byoin&time=08:00",
  },
  parameters: {
    docs: {
      description: {
        story:
          "When there are two route results, the route tabs are displayed with both options.",
      },
    },
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: {
    tripDetails: createMockTripDetails(1),
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Loading state while fetching route results.",
      },
    },
  },
};
