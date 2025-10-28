import type { Meta, StoryObj } from "@storybook/react";

import { SimpleBusStopInfoPage } from "./SimpleBusStopInfoPage";

const meta = {
  title: "Domains/BusStop/SimpleBusStopInfoPage",
  component: SimpleBusStopInfoPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Simple Mode version of the Bus Stop Information Page.

**Features:**
- 🔤 Extra large fonts (1.25rem - 2.25rem) for easy reading
- 🎨 Color-coded sections with clear visual hierarchy
- 📱 Large touch targets for mobile accessibility
- ⏱️ Prominent display of next bus arrival time
- 🗺️ Clear route visualization with current position
- 🎯 Focused on essential information only

**Design Principles:**
- Information hierarchy: Next bus → Upcoming buses → Full route
- Visual emphasis on time-critical information
- Generous spacing reduces cognitive load
- High contrast colors for outdoor readability
        `,
      },
    },
  },
  args: {
    busStopName: "中央公園",
    distance: "徒歩2分 (約150m)",
  },
} satisfies Meta<typeof SimpleBusStopInfoPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view with next bus information
 */
export const WithNextBus: Story = {
  args: {
    nextBus: {
      line: "都心循環線",
      destination: "東駅",
      arrivalTime: "14:35",
      minutesUntil: 5,
    },
    upcomingBuses: [
      {
        line: "都心循環線",
        destination: "東駅",
        arrivalTime: "14:50",
      },
      {
        line: "青葉台線",
        destination: "緑が丘",
        arrivalTime: "15:05",
      },
      {
        line: "都心循環線",
        destination: "東駅",
        arrivalTime: "15:10",
      },
    ],
    routeStops: [
      { name: "中央公園", time: "14:35 発", isCurrent: true },
      { name: "市役所前", time: "14:38" },
      { name: "西口", time: "14:42" },
      { name: "南町", time: "14:47" },
      { name: "東駅", time: "14:52 着" },
    ],
  },
};

/**
 * View with no current buses running
 */
export const NoBusesRunning: Story = {
  args: {
    busStopName: "市役所前",
    distance: "徒歩5分 (約400m)",
    nextBus: undefined,
    upcomingBuses: [],
    routeStops: [],
  },
};

/**
 * View with upcoming buses but no immediate next bus
 */
export const UpcomingBusesOnly: Story = {
  args: {
    busStopName: "東駅",
    distance: "徒歩3分 (約250m)",
    nextBus: undefined,
    upcomingBuses: [
      {
        line: "都心循環線",
        destination: "中央公園",
        arrivalTime: "16:00",
      },
      {
        line: "青葉台線",
        destination: "緑が丘",
        arrivalTime: "16:15",
      },
      {
        line: "南北縦断線",
        destination: "大学病院",
        arrivalTime: "16:30",
      },
    ],
  },
};

/**
 * Complete view with all information
 */
export const CompleteInformation: Story = {
  args: {
    busStopName: "緑が丘",
    distance: "徒歩1分 (約80m)",
    nextBus: {
      line: "南北縦断線",
      destination: "大学病院",
      arrivalTime: "13:42",
      minutesUntil: 2,
    },
    upcomingBuses: [
      {
        line: "青葉台線",
        destination: "東駅",
        arrivalTime: "13:55",
      },
      {
        line: "南北縦断線",
        destination: "大学病院",
        arrivalTime: "14:12",
      },
      {
        line: "青葉台線",
        destination: "東駅",
        arrivalTime: "14:25",
      },
      {
        line: "南北縦断線",
        destination: "中央公園",
        arrivalTime: "14:42",
      },
    ],
    routeStops: [
      { name: "緑が丘", time: "13:42 発", isCurrent: true },
      { name: "中央公園", time: "13:47" },
      { name: "さくら通り", time: "13:52" },
      { name: "北高前", time: "13:58" },
      { name: "大学病院", time: "14:05 着" },
    ],
  },
};

/**
 * Interactive demo with back button
 */
export const WithBackButton: Story = {
  args: {
    ...CompleteInformation.args,
    onBack: () => console.log("Back button clicked"),
  },
};

/**
 * Accessibility demo story
 */
export const AccessibilityFeatures: Story = {
  args: WithNextBus.args,
  parameters: {
    docs: {
      description: {
        story: `
This story demonstrates accessibility features:

- **Large Text**: Minimum 1.25rem for body text, up to 2.25rem for headings
- **Color Contrast**: Blue (#3b82f6) on white backgrounds exceeds WCAG AA
- **Countdown Display**: Large, high-contrast countdown for time-critical info
- **Visual Hierarchy**: Clear sections with distinct backgrounds
- **Touch Targets**: Back button and all interactive elements meet 44px minimum
- **Spacing**: Generous padding (2xl-4xl) reduces accidental taps
        `,
      },
    },
  },
};
