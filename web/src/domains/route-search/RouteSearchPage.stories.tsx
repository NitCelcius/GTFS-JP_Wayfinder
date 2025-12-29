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

// Story with search callback that logs results
export const WithSearchCallback: Story = {
  args: {
    onSearch: (result) => {
      console.log("Route search completed:", result);
      alert(
        `${result.originStopName} から ${result.destinationStopName} への経路が検索されました`
      );
    },
  },
  parameters: {
    docs: {
      description: {
        story: `Search form with callback handler. When user performs a search, the onSearch callback receives the route result data.`,
      },
    },
  },
};

