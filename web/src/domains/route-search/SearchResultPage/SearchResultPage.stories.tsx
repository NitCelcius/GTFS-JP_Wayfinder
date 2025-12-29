import type { Meta, StoryObj } from "@storybook/react";

import { mockSingleRouteTripDetails, mockTwoRoutesTripDetails } from "@/mocks";

import { SearchResultPage } from "./SearchResultPage";

const meta = {
  title: "Domains/RouteSearch/SearchResultPage",
  component: SearchResultPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "バス経路検索結果を表示するページ。乗り換え情報、料金、時刻表を含む詳細な経路情報を表示します。",
      },
    },
  },
  args: {
    onRouteSelect: (routeId: string) => console.log("Route selected:", routeId),
    onBack: () => console.log("Back clicked"),
    onNavigateToBusStop: () => console.log("Navigate to bus stop"),
    onNavigateToRecent: () => console.log("Navigate to recent"),
    showCosts: true,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "393px", margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchResultPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Single route result - The route tabs should NOT be displayed
 */
export const SingleRoute: Story = {
  args: {
    tripDetails: mockSingleRouteTripDetails,
    searchUrl:
      "http://localhost:3000/route-search?from=higashi-eki&to=daigaku-byoin&time=08:00",
  },
  parameters: {
    docs: {
      description: {
        story:
          'When there is only one route result, the route tabs (showing "経路 1") are not displayed. This reduces visual clutter when there are no alternative routes to choose from.',
      },
    },
  },
};

/**
 * Two routes - Route tabs ARE displayed
 */
export const TwoRoutes: Story = {
  args: {
    tripDetails: mockTwoRoutesTripDetails,
    searchUrl:
      "http://localhost:3000/route-search?from=higashi-eki&to=daigaku-byoin&time=08:00",
  },
  parameters: {
    docs: {
      description: {
        story:
          "When there are two or more route results, the route tabs are displayed to allow users to switch between different route options.",
      },
    },
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: {
    tripDetails: mockSingleRouteTripDetails,
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Loading state while fetching route results.",
      },
    },
  },
};
