import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { DepartureTimeModal } from "./DepartureTimeModal";

const meta = {
  title: "Components/Common/DepartureTimeModal",
  component: DepartureTimeModal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DepartureTimeModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component for interactive stories
function DepartureTimeModalWrapper({
  initialDateTime,
}: {
  initialDateTime?: Date;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedTime, setSelectedTime] = useState<Date | undefined>(
    initialDateTime
  );

  const handleConfirm = (dateTime: Date | undefined) => {
    setSelectedTime(dateTime);
    console.log("Selected time:", dateTime);
    if (dateTime === undefined) {
      console.log("Time set to 'now' (undefined)");
    } else {
      console.log(
        "Time set to:",
        dateTime.toLocaleString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
    // Reopen modal for testing
    setTimeout(() => setIsOpen(true), 500);
  };

  const handleClose = () => {
    console.log("Modal closed without confirmation");
    // Reopen modal for testing
    setTimeout(() => setIsOpen(true), 500);
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: "1rem 2rem",
          background: "var(--color-action-primary)",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          cursor: "pointer",
          fontSize: "1rem",
          fontWeight: 600,
        }}
      >
        出発時刻を選択
      </button>
      <div style={{ marginTop: "1rem", fontSize: "1rem" }}>
        現在の選択:{" "}
        {selectedTime === undefined
          ? "今すぐ"
          : selectedTime.toLocaleString("ja-JP", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
      </div>
      <DepartureTimeModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        initialDateTime={selectedTime}
      />
    </div>
  );
}

// Default story - opens with current time (should result in undefined when confirmed)
export const Default: Story = {
  render: () => <DepartureTimeModalWrapper />,
  args: {
    isOpen: true,
    onClose: () => console.log("closed"),
    onConfirm: () => console.log("confirmed"),
  },
};

// Story with pre-selected time (2 hours from now)
export const WithPreselectedTime: Story = {
  render: () => {
    const futureTime = new Date();
    futureTime.setHours(futureTime.getHours() + 2);
    return <DepartureTimeModalWrapper initialDateTime={futureTime} />;
  },
  args: {
    isOpen: true,
    onClose: () => console.log("closed"),
    onConfirm: () => console.log("confirmed"),
  },
};

// Story demonstrating "now" functionality
export const NowButton: Story = {
  render: () => <DepartureTimeModalWrapper />,
  args: {
    isOpen: true,
    onClose: () => console.log("closed"),
    onConfirm: () => console.log("confirmed"),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Click the "今すぐ" button to set the time to now, which will result in undefined when confirmed.',
      },
    },
  },
};

// Story with tomorrow's time
export const TomorrowTime: Story = {
  render: () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 9:00 AM tomorrow
    return <DepartureTimeModalWrapper initialDateTime={tomorrow} />;
  },
  args: {
    isOpen: true,
    onClose: () => console.log("closed"),
    onConfirm: () => console.log("confirmed"),
  },
  parameters: {
    docs: {
      description: {
        story: "Modal pre-filled with tomorrow at 9:00 AM.",
      },
    },
  },
};

// Story demonstrating close behavior
export const CloseBehavior: Story = {
  render: () => <DepartureTimeModalWrapper />,
  args: {
    isOpen: true,
    onClose: () => console.log("closed"),
    onConfirm: () => console.log("confirmed"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Click outside the modal or press the X button to close without confirming. Press Escape key to close as well.",
      },
    },
  },
};
