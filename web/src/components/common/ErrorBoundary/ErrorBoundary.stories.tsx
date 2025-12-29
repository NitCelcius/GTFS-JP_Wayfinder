import type { Meta, StoryObj } from "@storybook/react";

import { ErrorBoundary } from "./ErrorBoundary";

const meta = {
  title: "Components/Common/ErrorBoundary",
  component: ErrorBoundary,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic error boundary with a custom message
 */
export const WithMessage: Story = {
  args: {
    message: "バス停情報の取得に失敗しました。もう一度お試しください。",
  },
};

/**
 * Error boundary without a specific message (shows only standard error text)
 */
export const WithoutMessage: Story = {
  args: {},
};
