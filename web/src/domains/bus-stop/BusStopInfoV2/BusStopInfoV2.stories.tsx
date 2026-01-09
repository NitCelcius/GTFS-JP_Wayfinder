import type { Meta, StoryObj } from "@storybook/react";

import { BusStopInfoV2 } from "./BusStopInfoV2";

const meta = {
  title: "Domains/BusStop/BusStopInfoV2",
  component: BusStopInfoV2,
  parameters: {
    layout: "fullscreen",
    chromatic: {
      delay: 300,
      pauseAnimationAtEnd: true,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BusStopInfoV2>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockUpcomingBuses = [
  {
    tripId: "trip-001",
    routeNumber: "400",
    routeName: "秋田御所野線",
    destination: "秋田駅東口",
    destinationLabel: "行",
    minutesUntilDeparture: 15,
    departureTime: "12:34",
    cost: 400,
    stopsUntilArrival: "2駅前に到着",
    routeColorText: "秋田御所野線",
  },
  {
    tripId: "trip-002",
    routeNumber: "123",
    routeName: "仁井田線",
    destination: "秋田駅東口",
    destinationLabel: "行",
    minutesUntilDeparture: 35,
    departureTime: "12:54",
    cost: 123,
    routeColorText: "仁井田線",
  },
  {
    tripId: "trip-003",
    routeNumber: "912",
    routeName: "県立プール線",
    destination: "県立プール前",
    destinationLabel: "行",
    minutesUntilDeparture: 44,
    departureTime: "13:12",
    cost: 912,
    routeColorText: "県立プール線",
  },
  {
    tripId: "trip-004",
    routeNumber: "831",
    routeName: "しゃくなげ線",
    destination: "ひょうたん",
    destinationLabel: "行",
    minutesUntilDeparture: 60,
    departureTime: "13:12",
    cost: 831,
    routeColorText: "しゃくなげ線",
  },
  {
    tripId: "trip-005",
    routeNumber: "401",
    routeName: "秋田御所野線",
    destination: "秋田駅東口",
    destinationLabel: "行",
    minutesUntilDeparture: 62,
    departureTime: "13:44",
    cost: 401,
    routeColorText: "秋田御所野線",
  },
];

const mockPastBus = {
  tripId: "trip-past",
  routeNumber: "314",
  routeName: "過去",
  destination: "秋田駅東口",
  destinationLabel: "行",
  minutesUntilDeparture: 12,
  departureTime: "12:22",
  cost: 314,
  isPast: true,
  routeColorText: "過去",
};

export const Default: Story = {
  args: {
    busStopId: "stop-001",
    busStopName: "hoge駅",
    distance: "約250m",
    platformCode: "3",
    pastBus: mockPastBus,
    upcomingBuses: mockUpcomingBuses,
    isLoading: false,
    error: null,
    hasValidCoordinates: true,
    onBack: () => console.log("Back clicked"),
    onRoutineSearch: () => console.log("Search destinations clicked"),
    onWalkDirections: () => console.log("Walk directions clicked"),
    onTransfer: () => console.log("Transfer clicked"),
    onRouteList: () => console.log("Route list clicked"),
    onBusClick: (bus) => console.log("Bus clicked:", bus),
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true,
    upcomingBuses: [],
  },
};

export const WithError: Story = {
  args: {
    ...Default.args,
    error: "バス停情報の取得に失敗しました",
    upcomingBuses: [],
  },
};

export const NoUpcomingBuses: Story = {
  args: {
    ...Default.args,
    upcomingBuses: [],
    pastBus: null,
  },
};

export const NoPastBus: Story = {
  args: {
    ...Default.args,
    pastBus: null,
  },
};

export const NoCoordinates: Story = {
  args: {
    ...Default.args,
    hasValidCoordinates: false,
  },
};

export const NoWalkDirectionsCallback: Story = {
  args: {
    ...Default.args,
    hasValidCoordinates: true,
    onWalkDirections: undefined,
  },
};
