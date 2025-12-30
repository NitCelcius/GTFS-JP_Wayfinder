import type { Meta, StoryObj } from "@storybook/react";

import React from "react";

import { RouteOptionCard } from "./RouteOptionCard";

const meta = {
  title: "Domains/RouteSearch/RouteOverviewPage/RouteOptionCard",
  component: RouteOptionCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Card component displaying a single route option with time information, visual progress indicator, fare, and transfer count. Used within RouteOverviewPage to show available route choices.",
      },
    },
    chromatic: { disableSnapshot: true }, // Visual changes tested in RouteOverviewPage story, skipping
  },
  decorators: [
    (Story) => (
      <div className="max-w-[var(--max-w-mobile)] p-[var(--spacing-lg)]">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof RouteOptionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    relativeTimeUntilDeparture: "3分後にバス停発",
    departureTime: "14:30",
    arrivalTime: "15:15",
    duration: "45分",
    fare: 220,
    transfers: 0,
    progressPercentage: 75,
    onClick: () => console.log("Route selected"),
  },
};

export const LongRoute: Story = {
  args: {
    relativeTimeUntilDeparture: "3分後にバス停発",
    departureTime: "14:30",
    arrivalTime: "15:30",
    duration: "60分",
    fare: 280,
    transfers: 1,
    progressPercentage: 100,
    onClick: () => console.log("Route selected"),
  },
};

export const Departed: Story = {
  args: {
    relativeTimeUntilDeparture: "2分前に出発済み",
    departureTime: "14:25",
    arrivalTime: "15:10",
    duration: "45分",
    fare: 220,
    transfers: 0,
    progressPercentage: 75,
    onClick: () => console.log("Route selected"),
  },
};
