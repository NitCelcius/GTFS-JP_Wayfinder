import type { Meta, StoryObj } from "@storybook/react";

import React from "react";

import { SearchSummary } from "./SearchSummary";

const meta = {
  title: "Domains/RouteSearch/RouteOverviewPage/SearchSummary",
  component: SearchSummary,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Summary component displaying the search timestamp. Shows when the route search was performed.",
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
} satisfies Meta<typeof SearchSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    searchDateTime: "14:27",
  },
};
