import type { Meta, StoryObj } from "@storybook/react";

import { BusStopHeader } from "./BusStopHeader";

const meta: Meta<typeof BusStopHeader> = {
  title: "BusStop/BusStopInfoV2/Internal/BusStopHeader",
  component: BusStopHeader,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    busStopName: { control: "text" },
    distance: { control: "text" },
    platformCode: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    busStopName: "中央公園",
    distance: "120m",
    platformCode: "3",
  },
};

export const WithDistanceFarAway: Story = {
  name: "With Distance (Far from Stop)",
  args: {
    busStopName: "秋田駅東口",
    distance: "1.2km",
    platformCode: "5",
  },
};

export const WithoutDistanceCloseBy: Story = {
  name: "Without Distance (Close to Stop)",
  args: {
    busStopName: "市役所前",
    platformCode: "2",
    distance: undefined,
  },
};

export const WithoutDistanceNoPermission: Story = {
  name: "Without Distance (No Location Permission)",
  args: {
    busStopName: "大学病院",
    platformCode: "1",
    distance: undefined,
  },
};

export const WithoutPlatformCode: Story = {
  args: {
    busStopName: "青葉台",
    distance: "350m",
  },
};
