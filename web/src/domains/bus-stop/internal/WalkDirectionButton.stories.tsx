import type { Meta, StoryObj } from "@storybook/react";

import { WalkDirectionButton } from "./WalkDirectionButton";

const meta: Meta<typeof WalkDirectionButton> = {
  title: "BusStop/Internal/WalkDirectionButton",
  component: WalkDirectionButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    lat: { control: "number" },
    lon: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default button showing walking directions to 中央公園 (Chuo Park)
 */
export const Default: Story = {
  args: {
    lat: 39.71676,
    lon: 140.13113,
  },
};

/**
 * Button for あきた芸術劇場ミルハス (Akita Art Theater Miruhas)
 */
export const ArtTheater: Story = {
  args: {
    lat: 39.71833,
    lon: 140.10278,
  },
};

/**
 * Button for 秋田駅前 (Akita Station)
 */
export const AkitaStation: Story = {
  args: {
    lat: 39.71861,
    lon: 140.10278,
  },
};
