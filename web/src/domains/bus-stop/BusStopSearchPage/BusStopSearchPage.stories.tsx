import type { Meta, StoryObj } from "@storybook/react";

import { BusStopSearchPage } from "@/domains";

const mockBusStopsList = [
  {
    id: "1021_01",
    name: "秋田駅東口",
    distance: "徒歩3分",
    selectUrl: "/bus-stop/1021_01",
  },
  {
    id: "shiyakusho-mae",
    name: "市役所前",
    distance: "徒歩5分",
    selectUrl: "/bus-stop/shiyakusho-mae",
  },
  {
    id: "aobadai",
    name: "青葉台",
    distance: "徒歩8分",
    selectUrl: "/bus-stop/aobadai",
  },
  {
    id: "sakura-dori",
    name: "さくら通り",
    distance: "徒歩7分",
    selectUrl: "/bus-stop/sakura-dori",
  },
  {
    id: "midori-ga-oka",
    name: "緑が丘",
    distance: "徒歩6分",
    selectUrl: "/bus-stop/midori-ga-oka",
  },
  {
    id: "higashi-eki",
    name: "東駅",
    distance: "徒歩2分",
    selectUrl: "/bus-stop/higashi-eki",
  },
  {
    id: "nishi-guchi",
    name: "西口",
    distance: "徒歩1分",
    selectUrl: "/bus-stop/nishi-guchi",
  },
  {
    id: "minami-machi",
    name: "南町",
    distance: "徒歩12分",
    selectUrl: "/bus-stop/minami-machi",
  },
  {
    id: "kita-ko-mae",
    name: "北高前",
    distance: "徒歩9分",
    selectUrl: "/bus-stop/kita-ko-mae",
  },
  {
    id: "daigaku-byoin",
    name: "大学病院",
    distance: "徒歩15分",
    selectUrl: "/bus-stop/daigaku-byoin",
  },
  {
    id: "miruhas-au",
    name: "あきた芸術劇場ミルハス・にぎわい交流館 AU 前",
    distance: "徒歩20分",
    selectUrl: "/bus-stop/miruhas-au",
  },
];

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
