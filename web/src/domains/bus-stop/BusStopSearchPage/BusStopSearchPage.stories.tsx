import type { Meta, StoryObj } from "@storybook/react";

import { mockBusStopsList } from "@/mocks";

import { BusStopSearchPage } from "./BusStopSearchPage";

const meta = {
  title: "Domains/BusStop/BusStopSearchPage",
  component: BusStopSearchPage,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  args: {
    onNavigateToRoute: () => console.log("Navigate to route"),
    onNavigateToRecent: () => console.log("Navigate to recent"),
    onNavigateToBusStopInfo: (busStopId: string, name?: string) =>
      console.log("Navigate to bus stop info:", busStopId, name),
  },
} satisfies Meta<typeof BusStopSearchPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state with nearby stops loaded (location permission granted)
 */
export const Default: Story = {
  args: {
    nearbyStops: mockBusStopsList.slice(0, 5),
    isLoadingNearby: false,
    hasLocationPermission: true,
  },
};

/**
 * Loading state while fetching user location and nearby stops
 */
export const Loading: Story = {
  args: {
    nearbyStops: [],
    isLoadingNearby: true,
    hasLocationPermission: false,
  },
};

/**
 * Location permission denied - shows fallback bus stop
 */
export const LocationDenied: Story = {
  args: {
    nearbyStops: [],
    isLoadingNearby: false,
    hasLocationPermission: false,
  },
  parameters: {
    docs: {
      description: {
        story: `
When geolocation permission is denied, the page displays a fallback bus stop "秋田駅東口" 
with a "位置情報無効" (location disabled) distance indicator.
        `,
      },
    },
  },
};

/**
 * With many nearby stops (scrollable list)
 */
export const WithManyStops: Story = {
  args: {
    nearbyStops: mockBusStopsList,
    isLoadingNearby: false,
    hasLocationPermission: true,
  },
  parameters: {
    docs: {
      description: {
        story: `
Shows the full list of ${mockBusStopsList.length} nearby bus stops, demonstrating the scrollable behavior.
        `,
      },
    },
  },
};

/**
 * Empty results - location enabled but no stops found
 */
export const NoStopsFound: Story = {
  args: {
    nearbyStops: [],
    isLoadingNearby: false,
    hasLocationPermission: true,
  },
  parameters: {
    docs: {
      description: {
        story: `
Edge case: User has granted location permission, but no bus stops were found nearby.
Shows fallback behavior similar to location denied state.
        `,
      },
    },
  },
};
