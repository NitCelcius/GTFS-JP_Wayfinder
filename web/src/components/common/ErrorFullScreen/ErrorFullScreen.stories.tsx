import type { Meta, StoryObj } from "@storybook/react";

import { ErrorFullScreen } from "./ErrorFullScreen";

const meta = {
  title: "Components/Common/ErrorFullScreen",
  component: ErrorFullScreen,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ErrorFullScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic error message with a custom message
 */
export const WithMessage: Story = {
  args: {
    message: "バス停情報の取得に失敗しました。もう一度お試しください。",
  },
};

/**
 * Error message without a specific message (shows only standard error text)
 */
export const WithoutMessage: Story = {
  args: {},
};
