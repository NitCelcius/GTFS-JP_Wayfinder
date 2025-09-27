import type { Meta, StoryObj } from "@storybook/react";

import mockBusStopsList from "@/mocks/busStops";

import { BusStopSearchPage } from "./BusStopSearchPage";

// Mock data constants that were moved from the main component
// These are kept here for documentation and Storybook stories
const MOCK_NEAREST_BUS_STOP = mockBusStopsList[5]; // 東駅 as nearest
const MOCK_SEARCH_RESULTS = mockBusStopsList.slice(0, 3);

const meta = {
  title: "Domains/BusStop/BusStopSearchPage",
  component: BusStopSearchPage,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BusStopSearchPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onNavigateToRoute: () => console.log("Navigate to route"),
    onNavigateToRecent: () => console.log("Navigate to recent"),
    onNavigateToBusStopInfo: (busStopId: string) =>
      console.log("Navigate to bus stop info:", busStopId),
  },
};

export const WithLocationDenied: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    docs: {
      description: {
        story: `
This story simulates the behavior when geolocation permission is denied.
In this case, only the fallback bus stop "秋田駅東口" will be shown as the nearest stop.
        `,
      },
    },
  },
};

export const WithMockData: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    docs: {
      description: {
        story: `
This story shows the BusStopSearchPage behavior. The component now integrates with:

**Real API Integration:**
- Uses the \`/stops/nearby\` API endpoint to fetch actual nearby bus stops
- Requests geolocation permission from the browser
- Falls back gracefully when location access is denied

**Mock Data (moved to Storybook):**
The following mock data was previously hardcoded in the component but has been moved here:

- **Previous Nearest Bus Stop**: ${MOCK_NEAREST_BUS_STOP.name} (${MOCK_NEAREST_BUS_STOP.id})
- **Previous Search Results**: ${MOCK_SEARCH_RESULTS.map((stop) => stop.name).join(", ")}

**Current Behavior:**
- Shows "秋田駅東口" as a fallback when location permission is denied
- Displays real nearby stops from the API when location permission is granted
- Maintains the search results section with mock data for now
        `,
      },
    },
  },
};

// Export mock data for use in tests or other components
export { MOCK_NEAREST_BUS_STOP, MOCK_SEARCH_RESULTS };
