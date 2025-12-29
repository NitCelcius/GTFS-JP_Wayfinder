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
    message: "バス停情報の取得に失敗しました",
  },
};

/**
 * Error boundary without a specific message (shows only standard error text)
 */
export const WithoutMessage: Story = {
  args: {},
};

/**
 * Error boundary with reset functionality
 */
export const WithReset: Story = {
  args: {
    message: "検索結果の読み込みに失敗しました",
    onReset: () => console.log("Reset clicked"),
  },
};

/**
 * Long error message example
 */
export const LongMessage: Story = {
  args: {
    message:
      "ネットワーク接続エラーが発生しました。インターネット接続を確認してから、もう一度お試しください。",
    onReset: () => console.log("Reset clicked"),
  },
};
