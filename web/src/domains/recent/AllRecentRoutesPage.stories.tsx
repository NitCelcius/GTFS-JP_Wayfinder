import type { Meta, StoryObj } from "@storybook/react";

import { AllRecentRoutesPage } from "./AllRecentRoutesPage";

const meta = {
  title: "Domains/Recent/AllRecentRoutesPage",
  component: AllRecentRoutesPage,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    onBack: () => console.log("Back clicked"),
    onNavigateToRouteSearch: (
      fromStopId: string,
      toStopId: string,
      fromStopName: string,
      toStopName: string
    ) =>
      console.log(
        "Navigate to route search:",
        fromStopId,
        toStopId,
        fromStopName,
        toStopName
      ),
  },
} satisfies Meta<typeof AllRecentRoutesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story - shows all route searches
export const Default: Story = {};
