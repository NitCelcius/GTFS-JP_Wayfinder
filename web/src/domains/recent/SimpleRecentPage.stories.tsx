import type { Meta, StoryObj } from "@storybook/react";

import { SimpleRecentPage } from "./SimpleRecentPage";

const meta = {
  title: "Domains/Recent/SimpleRecentPage",
  component: SimpleRecentPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Simple Mode version of the Recent Searches Page.

**Features:**
- 📋 Clear separation between bus stop and route history
- 🔤 Large, readable text (1.25rem - 2.5rem)
- 🎯 Easy-to-tap cards with generous padding
- 🎨 Color-coded sections (blue for bus stops, purple for routes)
- ⏰ Prominent display of search timestamps
- 📱 Mobile-optimized responsive layout

**Design Principles:**
- Chronological order with clear timestamps
- Visual distinction between different search types
- One-tap access to previous searches
- Empty states guide users when no history exists
- Clear hover/active states for feedback
        `,
      },
    },
  },
} satisfies Meta<typeof SimpleRecentPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view with sample history data
 */
export const Default: Story = {
  args: {
    recentBusStops: [
      {
        id: "recent-bus-1",
        name: "中央公園",
        distance: "徒歩2分",
        searchedAt: "今日 14:30",
      },
      {
        id: "recent-bus-2",
        name: "市役所前",
        distance: "徒歩5分",
        searchedAt: "今日 12:15",
      },
      {
        id: "recent-bus-3",
        name: "東駅",
        distance: "徒歩3分",
        searchedAt: "昨日 18:45",
      },
    ],
    recentRoutes: [
      {
        id: "recent-route-1",
        fromStation: "東駅",
        toStation: "中央公園",
        searchedAt: "今日 14:25",
      },
      {
        id: "recent-route-2",
        fromStation: "東駅",
        toStation: "緑が丘",
        searchedAt: "今日 11:30",
      },
      {
        id: "recent-route-3",
        fromStation: "西口",
        toStation: "大学病院",
        searchedAt: "昨日 19:20",
      },
    ],
    onBusStopSelect: (id) => console.log("Bus stop selected:", id),
    onRouteSelect: (from, to) => console.log("Route selected:", from, "→", to),
  },
};

/**
 * View with no history (empty state)
 */
export const EmptyHistory: Story = {
  args: {
    recentBusStops: [],
    recentRoutes: [],
  },
};

/**
 * View with only bus stop history
 */
export const BusStopsOnly: Story = {
  args: {
    recentBusStops: [
      {
        id: "recent-bus-1",
        name: "中央公園",
        distance: "徒歩2分",
        searchedAt: "今日 14:30",
      },
      {
        id: "recent-bus-2",
        name: "市役所前",
        distance: "徒歩5分",
        searchedAt: "今日 12:15",
      },
      {
        id: "recent-bus-3",
        name: "東駅",
        distance: "徒歩3分",
        searchedAt: "昨日 18:45",
      },
      {
        id: "recent-bus-4",
        name: "緑が丘",
        distance: "徒歩7分",
        searchedAt: "昨日 16:20",
      },
      {
        id: "recent-bus-5",
        name: "さくら通り",
        distance: "徒歩4分",
        searchedAt: "2日前 10:00",
      },
    ],
    recentRoutes: [],
    onBusStopSelect: (id) => console.log("Bus stop selected:", id),
  },
};

/**
 * View with only route history
 */
export const RoutesOnly: Story = {
  args: {
    recentBusStops: [],
    recentRoutes: [
      {
        id: "recent-route-1",
        fromStation: "東駅",
        toStation: "中央公園",
        searchedAt: "今日 14:25",
      },
      {
        id: "recent-route-2",
        fromStation: "東駅",
        toStation: "緑が丘",
        searchedAt: "今日 11:30",
      },
      {
        id: "recent-route-3",
        fromStation: "西口",
        toStation: "大学病院",
        searchedAt: "昨日 19:20",
      },
      {
        id: "recent-route-4",
        fromStation: "さくら通り",
        toStation: "北高前",
        searchedAt: "昨日 16:40",
      },
      {
        id: "recent-route-5",
        fromStation: "緑が丘",
        toStation: "さくら通り",
        searchedAt: "2日前 13:15",
      },
    ],
    onRouteSelect: (from, to) => console.log("Route selected:", from, "→", to),
  },
};

/**
 * Interactive demo with all handlers
 */
export const Interactive: Story = {
  args: {
    ...Default.args,
    onBack: () => console.log("Back button clicked"),
    onBusStopSelect: (id) => alert(`バス停を選択: ${id}`),
    onRouteSelect: (from, to) => alert(`経路を選択: ${from} → ${to}`),
  },
};

/**
 * Mobile view demonstration
 */
export const MobileView: Story = {
  args: Default.args,
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story: `
Mobile-optimized view with:

- Stacked layout for route stations on small screens
- Rotated arrow (→ becomes ↓) for vertical flow
- Adjusted font sizes for mobile readability
- Touch-friendly tap targets (minimum 44px height)
        `,
      },
    },
  },
};

/**
 * Accessibility features demonstration
 */
export const AccessibilityDemo: Story = {
  args: Default.args,
  parameters: {
    docs: {
      description: {
        story: `
Accessibility features include:

- **Large Touch Targets**: All cards are at least 80px tall
- **High Contrast**: Text on white backgrounds meets WCAG AA
- **Clear Hierarchy**: Sections clearly separated with icons
- **Hover Feedback**: Visual feedback on all interactive elements
- **Empty States**: Clear messaging when no history exists
- **Semantic HTML**: Proper use of sections and headings
- **Color Independence**: Information not conveyed by color alone
        `,
      },
    },
  },
};
