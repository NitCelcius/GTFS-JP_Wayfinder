import type { Meta, StoryObj } from "@storybook/react";

import { SimpleRouteSearchPage } from "./SimpleRouteSearchPage";

const meta = {
  title: "Domains/RouteSearch/SimpleRouteSearchPage",
  component: SimpleRouteSearchPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Simple Mode version of the Route Search Page.

**Features:**
- ✨ Larger fonts (1.5rem - 2.5rem) for better readability
- 🎯 Clear, verbose labels with emojis for visual guidance
- 🧹 Clean, spacious layout with generous padding
- ♿ High contrast colors for accessibility
- 📱 Mobile-responsive design
- 🎨 Gradient backgrounds for visual appeal

**Design Principles:**
- One task per screen: route search
- Clear call-to-action with large buttons
- Minimal cognitive load with step-by-step flow
- Visual feedback on all interactions
        `,
      },
    },
  },
  args: {
    onSearch: (result) => console.log("Search triggered:", result),
  },
} satisfies Meta<typeof SimpleRouteSearchPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default simple mode view with clean, large UI elements
 */
export const Default: Story = {};

/**
 * Interactive example showing the search flow
 */
export const Interactive: Story = {
  args: {
    onSearch: (result) => {
      alert(
        `経路検索:\n${result.originStopName} → ${result.destinationStopName}\n出発時刻: ${result.beginTime}`
      );
    },
  },
};

/**
 * Example demonstrating accessibility features:
 * - Large touch targets (5rem minimum)
 * - High contrast text
 * - Clear visual hierarchy
 */
export const AccessibilityDemo: Story = {
  parameters: {
    docs: {
      description: {
        story: `
This variant demonstrates the accessibility features:

- **Touch Targets**: All interactive elements are at least 5rem (80px) tall
- **Font Sizes**: Body text starts at 1.25rem, headings at 2.5rem
- **Color Contrast**: All text meets WCAG AA standards
- **Visual Feedback**: Hover, active, and disabled states are clearly distinct
- **Keyboard Navigation**: Full keyboard support with visible focus indicators
        `,
      },
    },
  },
};
