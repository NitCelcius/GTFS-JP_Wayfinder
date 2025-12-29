import type { Meta, StoryObj } from "@storybook/react";

import { RouteSearchPage } from "./RouteSearchPage";

const meta = {
  title: "Domains/RouteSearch/RouteSearchPage",
  component: RouteSearchPage,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    onSearch: (result) => console.log("Search triggered:", result),
    onNavigateToBusStop: () => console.log("Navigate to bus stop"),
    onNavigateToRecent: () => console.log("Navigate to recent"),
  },
} satisfies Meta<typeof RouteSearchPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story - shows the route search form
export const Default: Story = {};
