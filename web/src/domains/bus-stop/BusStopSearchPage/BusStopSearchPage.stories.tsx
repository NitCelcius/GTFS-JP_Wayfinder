import type { Meta, StoryObj } from "@storybook/react";

import type { BusStop } from "../types";
import { BusStopSearchPage } from "./BusStopSearchPage";

const mockBusStopsList: BusStop[] = [
  {
    id: "1021_01",
    name: "秋田駅東口",
    distance: "約50m (徒歩1分)",
  },
  {
    id: "shiyakusho-mae",
    name: "市役所前",
    distance: "約350m (徒歩5分)",
  },
  {
    id: "aobadai",
    name: "青葉台",
    distance: "約600m (徒歩8分)",
  },
  {
    id: "sakura-dori",
    name: "さくら通り",
    distance: "約500m (徒歩7分)",
  },
  {
    id: "midori-ga-oka",
    name: "緑が丘",
    distance: "約450m (徒歩6分)",
  },
  {
    id: "higashi-eki",
    name: "東駅",
    distance: "約150m (徒歩2分)",
  },
  {
    id: "nishi-guchi",
    name: "西口",
    distance: "約100m (徒歩1分)",
  },
  {
    id: "minami-machi",
    name: "南町",
    distance: "約900m (徒歩12分)",
  },
  {
    id: "kita-ko-mae",
    name: "北高前",
    distance: "約650m (徒歩9分)",
  },
  {
    id: "daigaku-byoin",
    name: "大学病院",
    distance: "約1.1km (徒歩15分)",
  },
  {
    id: "miruhas-au",
    name: "あきた芸術劇場ミルハス・にぎわい交流館 AU 前",
    distance: "約1.5km (徒歩20分)",
  },
];

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
 * Single nearby stop found
 */
export const SingleStop: Story = {
  args: {
    nearbyStops: [mockBusStopsList[5]], // 東駅
    isLoadingNearby: false,
    hasLocationPermission: true,
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
