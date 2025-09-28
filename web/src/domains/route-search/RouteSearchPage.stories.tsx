import type { Meta, StoryObj } from "@storybook/react";

import {
  mockAlternativeRouteSearchResult,
  mockEmptyRouteSearchResult,
  mockRouteSearchResult,
  mockSingleRouteSearchResult,
} from "@/mocks/routeSearchMocks";

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

// Story with handlers that log the search results
export const WithMockData: Story = {
  args: {
    onSearch: (result) => {
      console.log("Route search completed:", result);
      // In a real app, this would navigate to the results page
      // For the story, we'll just log the result
    },
  },
};

// Story showing what the search result would look like
export const SearchResultExample: Story = {
  parameters: {
    docs: {
      description: {
        story: `Example of what the search result data structure looks like. 
        When the user performs a search, the onSearch callback will be called with this type of data.`,
      },
    },
  },
  args: {
    onSearch: (result) => {
      console.log("検索結果の構造:", result);
      alert(
        `${result.originStopName} から ${result.destinationStopName} への経路オプションが見つかりました`
      );
    },
  },
};

// Export mock data for other stories to use
export {
  mockRouteSearchResult,
  mockEmptyRouteSearchResult,
  mockSingleRouteSearchResult,
  mockAlternativeRouteSearchResult,
};

// Story demonstrating different mock scenarios
export const MockScenarios = {
  args: {
    onSearch: (result) => {
      console.log("モック結果:", result);
      alert(
        `${result.originStopName} から ${result.destinationStopName} への検索が実行されました`
      );
    },
  },
  parameters: {
    docs: {
      description: {
        story: `このストーリーは異なるモックシナリオの処理方法を実演します:
        - 空の結果（経路が見つからない）
        - 単一の経路結果
        - 複数の経路オプション  
        - 代替の出発地/目的地ペア`,
      },
    },
  },
} satisfies Story;
