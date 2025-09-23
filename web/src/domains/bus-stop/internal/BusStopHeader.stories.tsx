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
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "中央公園",
    distance: "120m",
  },
};

export const LongName: Story = {
  args: {
    name: "あきた芸術劇場ミルハス・にぎわい交流館 AU 前",
    distance: "300m",
  },
};
