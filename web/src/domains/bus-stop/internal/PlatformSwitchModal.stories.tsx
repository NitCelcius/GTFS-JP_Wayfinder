import type { Meta, StoryObj } from "@storybook/react";

import { type PlatformInfo, PlatformSwitchModal } from "./PlatformSwitchModal";

const meta: Meta<typeof PlatformSwitchModal> = {
  title: "Domains/BusStop/Internal/PlatformSwitchModal",
  component: PlatformSwitchModal,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    isOpen: true,
    onClose: () => console.log("Modal closed"),
    onPlatformSelect: (platform: PlatformInfo) =>
      console.log("Platform selected:", platform),
  },
};

export default meta;
type Story = StoryObj<typeof PlatformSwitchModal>;

const mockPlatforms: PlatformInfo[] = [
  {
    stopId: "1022_02",
    stopName: "秋田駅西口",
    platformCode: "2",
    lat: 39.71729,
    lon: 140.12843,
  },
  {
    stopId: "1022_03",
    stopName: "秋田駅西口",
    platformCode: "3",
    lat: 39.71719,
    lon: 140.12843,
  },
  {
    stopId: "1022_04",
    stopName: "秋田駅西口",
    platformCode: "4",
    lat: 39.71709,
    lon: 140.12843,
  },
  {
    stopId: "1022_05",
    stopName: "秋田駅西口",
    platformCode: "5",
    lat: 39.71702,
    lon: 140.12847,
  },
  {
    stopId: "1022_06",
    stopName: "秋田駅西口",
    platformCode: "6",
    lat: 39.71729,
    lon: 140.1283,
  },
  {
    stopId: "1022_07",
    stopName: "秋田駅西口",
    platformCode: "7",
    lat: 39.71719,
    lon: 140.1283,
  },
  {
    stopId: "1022_08",
    stopName: "秋田駅西口",
    platformCode: "8",
    lat: 39.71706,
    lon: 140.12834,
  },
  {
    stopId: "1022_09",
    stopName: "秋田駅西口",
    platformCode: "9",
    lat: 39.71696,
    lon: 140.12834,
  },
];

export const Default: Story = {
  args: {
    currentStopId: "1022_05",
    platforms: mockPlatforms,
  },
};

export const Loading: Story = {
  args: {
    currentStopId: "1022_02",
    platforms: [],
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    currentStopId: "1022_02",
    platforms: [],
    error: "停留所情報の取得に失敗しました",
  },
};

export const NoPlatformCode: Story = {
  args: {
    currentStopId: "1002_01",
    platforms: [
      {
        stopId: "1002_01",
        stopName: "勝平交番前",
        platformCode: null,
        lat: 39.6966,
        lon: 140.0849,
      },
      {
        stopId: "1002_02",
        stopName: "勝平交番前",
        platformCode: null,
        lat: 39.6963,
        lon: 140.0857,
      },
    ],
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    currentStopId: "1022_02",
    platforms: mockPlatforms,
  },
};
