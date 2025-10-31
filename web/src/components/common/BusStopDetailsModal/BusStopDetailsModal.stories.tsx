import type { Meta, StoryObj } from "@storybook/react";

import { useState } from "react";

import { BusStopDetailsModal } from "./BusStopDetailsModal";

const meta: Meta<typeof BusStopDetailsModal> = {
  title: "Common/BusStopDetailsModal",
  component: BusStopDetailsModal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component to handle modal state
function ModalWrapper({
  stopName,
  stopId,
}: {
  stopName: string;
  stopId?: string;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: "1rem 2rem",
          fontSize: "1.125rem",
          backgroundColor: "var(--color-action-primary)",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          cursor: "pointer",
        }}
      >
        バス停詳細を開く
      </button>
      <BusStopDetailsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        stopName={stopName}
        stopId={stopId}
      />
    </>
  );
}

export const Default: Story = {
  render: () => <ModalWrapper stopName="中央公園" />,
};

export const WithStopId: Story = {
  render: () => <ModalWrapper stopName="中央公園" stopId="1021_01" />,
};

export const LongStopName: Story = {
  render: () => (
    <ModalWrapper stopName="あきた芸術劇場ミルハス・にぎわい交流館 AU 前" />
  ),
};

export const AnotherStop: Story = {
  render: () => <ModalWrapper stopName="市役所前" />,
};
