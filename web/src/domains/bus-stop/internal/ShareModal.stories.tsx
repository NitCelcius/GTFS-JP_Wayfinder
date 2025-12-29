import type { Meta, StoryObj } from "@storybook/react";

import { ShareModal } from "./ShareModal";

const meta: Meta<typeof ShareModal> = {
  title: "BusStop/Internal/ShareModal",
  component: ShareModal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    shareUrl: { control: "text" },
    title: { control: "text" },
    isOpen: { control: "boolean" },
    onClose: { action: "closeModal" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default ShareModal state with full URL
 */
export const Default: Story = {
  args: {
    shareUrl: "https://example.com/bus-stop/123",
    title: "バス停情報",
    isOpen: true,
    onClose: () => console.log("Modal closed"),
  },
};

/**
 * ShareModal in closed state (should render nothing)
 */
export const Closed: Story = {
  args: {
    shareUrl: "https://example.com/bus-stop/123",
    title: "バス停情報",
    isOpen: false,
    onClose: () => console.log("Modal closed"),
  },
};
