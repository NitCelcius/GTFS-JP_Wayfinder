import type { Meta, StoryObj } from "@storybook/react";

import type { BusInfo } from "../types";
import { NextBusInfo } from "./NextBusInfo";

const meta: Meta<typeof NextBusInfo> = {
  title: "BusStop/Internal/NextBusInfo",
  component: NextBusInfo,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    canShowPrevious: { control: "boolean" },
    canShowNext: { control: "boolean" },
    onPreviousBus: { action: "previousBusClicked" },
    onNextBus: { action: "nextBusClicked" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultBusInfo: BusInfo = {
  tripId: "trip-001",
  line: "都心循環線",
  system: "系統001",
  destination: "東駅",
  direction: "行",
  arrivalTime: "13:05",
  arrivalDatetime: new Date("2025-11-04T13:05:00"),
  status: "当バス停着",
};

const longNameBusInfo: BusInfo = {
  tripId: "trip-002",
  line: "文教医療線",
  system: "系統003",
  destination: "あきた芸術劇場ミルハス・にぎわい交流館 AU 前",
  direction: "行",
  arrivalTime: "14:30",
  arrivalDatetime: new Date("2025-11-04T14:30:00"),
  status: "当バス停着",
};

const futureBusInfo: BusInfo = {
  tripId: "trip-003",
  line: "青葉台線",
  system: "系統002",
  destination: "緑が丘",
  direction: "行",
  arrivalTime: "15:45",
  arrivalDatetime: new Date("2025-11-04T15:45:00"),
  status: "当バス停着",
};

/**
 * Default state showing next bus without navigation options
 */
export const Default: Story = {
  args: {
    busInfo: defaultBusInfo,
  },
};

/**
 * With navigation enabled - can go to previous and next buses
 */
export const WithNavigation: Story = {
  args: {
    busInfo: defaultBusInfo,
    canShowPrevious: true,
    canShowNext: true,
    onPreviousBus: () => console.log("Previous bus clicked"),
    onNextBus: () => console.log("Next bus clicked"),
  },
};

/**
 * Can only navigate to next bus
 */
export const OnlyNextAvailable: Story = {
  args: {
    busInfo: defaultBusInfo,
    canShowPrevious: false,
    canShowNext: true,
    onNextBus: () => console.log("Next bus clicked"),
  },
};

/**
 * Can only navigate to previous bus (last bus scenario)
 */
export const OnlyPreviousAvailable: Story = {
  args: {
    busInfo: defaultBusInfo,
    canShowPrevious: true,
    canShowNext: false,
    onPreviousBus: () => console.log("Previous bus clicked"),
  },
};

/**
 * Bus info with a very long destination name
 */
export const LongDestinationName: Story = {
  args: {
    busInfo: longNameBusInfo,
    canShowPrevious: true,
    canShowNext: true,
  },
};

/**
 * Future bus with later arrival time
 */
export const FutureBus: Story = {
  args: {
    busInfo: futureBusInfo,
    canShowPrevious: true,
    canShowNext: true,
  },
};

/**
 * Interactive story with handlers that log to console
 */
export const Interactive: Story = {
  args: {
    busInfo: defaultBusInfo,
    canShowPrevious: true,
    canShowNext: true,
    onPreviousBus: () => console.log("Navigated to previous bus"),
    onNextBus: () => console.log("Navigated to next bus"),
  },
};
