import type { Meta, StoryObj } from "@storybook/react";

import { useState } from "react";

import type { EnrichedTrip } from "@/api/types.gen";

import {
  type BusStopDetails,
  BusStopDetailsModalContent,
} from "./BusStopDetailsModalContent";

const meta: Meta<typeof BusStopDetailsModalContent> = {
  title: "Common/BusStopDetailsModal",
  component: BusStopDetailsModalContent,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for upcoming buses
const mockUpcomingBuses: EnrichedTrip[] = [
  {
    trip_id: "平日_08時00分_系統001",
    arrival_time: "08:15:00",
    departure_time: "08:15:00",
    arrival_datetime: "2021-01-01T08:15:00",
    departure_datetime: "2021-01-01T08:15:00",
  },
  {
    trip_id: "平日_08時30分_系統001",
    arrival_time: "08:45:00",
    departure_time: "08:45:00",
    arrival_datetime: "2021-01-01T08:45:00",
    departure_datetime: "2021-01-01T08:45:00",
  },
  {
    trip_id: "平日_09時00分_系統002",
    arrival_time: "09:10:00",
    departure_time: "09:12:00",
    arrival_datetime: "2021-01-01T09:10:00",
    departure_datetime: "2021-01-01T09:12:00",
  },
];

const mockDetailsWithLocation: BusStopDetails = {
  stopId: "1021_01",
  stopName: "中央公園",
  location: {
    lat: 39.71676,
    lon: 140.13113,
  },
  upcomingBuses: mockUpcomingBuses,
};

const mockDetailsWithoutLocation: BusStopDetails = {
  stopId: "1022_01",
  stopName: "市役所前",
  upcomingBuses: mockUpcomingBuses,
};

const mockDetailsNoBuses: BusStopDetails = {
  stopId: "1023_01",
  stopName: "青葉台",
  location: {
    lat: 39.72,
    lon: 140.14,
  },
  upcomingBuses: [],
};

const mockDetailsLongName: BusStopDetails = {
  stopId: "1024_01",
  stopName: "あきた芸術劇場ミルハス・にぎわい交流館 AU 前",
  location: {
    lat: 39.718,
    lon: 140.128,
  },
  upcomingBuses: mockUpcomingBuses.slice(0, 2),
};

// Wrapper component to handle modal state
function ModalWrapper({
  details,
  isLoading = false,
  error = null,
}: {
  details: BusStopDetails | null;
  isLoading?: boolean;
  error?: string | null;
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
      <BusStopDetailsModalContent
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        details={details}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
}

export const Default: Story = {
  render: () => <ModalWrapper details={mockDetailsWithLocation} />,
};

export const WithoutLocation: Story = {
  render: () => <ModalWrapper details={mockDetailsWithoutLocation} />,
};

export const NoBuses: Story = {
  render: () => <ModalWrapper details={mockDetailsNoBuses} />,
};

export const LongStopName: Story = {
  render: () => <ModalWrapper details={mockDetailsLongName} />,
};

export const Loading: Story = {
  render: () => <ModalWrapper details={null} isLoading={true} />,
};

export const Error: Story = {
  render: () => (
    <ModalWrapper
      details={null}
      error="バス停情報の取得に失敗しました。もう一度お試しください。"
    />
  ),
};
