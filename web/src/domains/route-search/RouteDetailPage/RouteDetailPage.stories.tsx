import type { Meta, StoryObj } from "@storybook/react";

import { mockRoute } from "@/mocks";

import { RouteDetailPage } from "./RouteDetailPage";

const meta = {
  title: "Domains/RouteSearch/RouteDetailPage",
  component: RouteDetailPage,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    route: mockRoute,
    fromStation: "東駅",
    toStation: "大学病院",
    onBack: () => console.log("Back clicked"),
    onNavigateToBusStop: () => console.log("Navigate to bus stop"),
    onNavigateToRecent: () => console.log("Navigate to recent"),
    showCosts: true,
  },
} satisfies Meta<typeof RouteDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default route detail view - Displays journey timeline for a selected route
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Shows the detailed journey information for a single selected route. Displays departure/arrival times for each station and fare costs.",
      },
    },
  },
};

/**
 * Without costs - Hide fare information
 */
export const WithoutCosts: Story = {
  args: {
    showCosts: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Route detail view with fare costs hidden. Useful when cost information is not available or not relevant.",
      },
    },
  },
};
