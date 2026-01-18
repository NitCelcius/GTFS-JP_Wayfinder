import type { Meta, StoryObj } from "@storybook/react";

import { BusStopHeader } from "./BusStopHeader";

const meta: Meta<typeof BusStopHeader> = {
  title: "BusStop/Internal/BusStopHeader",
  component: BusStopHeader,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    name: { control: "text" },
    distance: { control: "text" },
    platformCode: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "中央公園",
    distance: "120m",
    platformCode: "3",
  },
};

export const WithDistanceFarAway: Story = {
  name: "With Distance (Far from Stop)",
  args: {
    name: "秋田駅東口",
    distance: "1.2km",
    platformCode: "5",
  },
};

export const WithoutDistanceCloseBy: Story = {
  name: "Without Distance (Close to Stop)",
  args: {
    name: "市役所前",
    distance: "",
    platformCode: "2",
  },
};

export const WithoutDistanceNoPermission: Story = {
  name: "Without Distance (No Location Permission)",
  args: {
    name: "大学病院",
    distance: "",
    platformCode: "1",
  },
};

export const WithoutPlatformCode: Story = {
  args: {
    name: "青葉台",
    distance: "350m",
  },
};
