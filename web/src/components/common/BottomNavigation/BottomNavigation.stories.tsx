import type { Meta, StoryObj } from "@storybook/react";

import { useState } from "react";

import { BottomNavigation } from "./BottomNavigation";

const meta = {
  title: "Components/Common/BottomNavigation",
  component: BottomNavigation,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BottomNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Bottom navigation with interactive tab switching.
 * Click on tabs to see the ripple animation:
 * - Clicking a different tab shows a green (primary) ripple
 * - Clicking the same tab again shows a gray (disabled) ripple
 */
export const Interactive: Story = {
  render: function InteractiveStory() {
    const [activeTab, setActiveTab] = useState<"bus-stop" | "route" | "recent">(
      "route"
    );

    return (
      <div
        style={{ height: "100vh", display: "flex", flexDirection: "column" }}
      >
        <div style={{ flex: 1, padding: "20px" }}>
          <h1>Click the tabs below to see the ripple animation</h1>
          <p>Current active tab: {activeTab}</p>
          <ul>
            <li>
              <strong>Switching tabs:</strong> Shows green (primary color)
              ripple
            </li>
            <li>
              <strong>Clicking the same tab:</strong> Shows gray (disabled
              color) ripple
            </li>
          </ul>
        </div>
        <BottomNavigation activeTab={activeTab} onTabClick={setActiveTab} />
      </div>
    );
  },
};

/**
 * Bottom navigation with route tab active
 */
export const RouteActive: Story = {
  args: {
    activeTab: "route",
  },
};

/**
 * Bottom navigation with bus stop tab active
 */
export const BusStopActive: Story = {
  args: {
    activeTab: "bus-stop",
  },
};

/**
 * Bottom navigation with recent tab active
 */
export const RecentActive: Story = {
  args: {
    activeTab: "recent",
  },
};
