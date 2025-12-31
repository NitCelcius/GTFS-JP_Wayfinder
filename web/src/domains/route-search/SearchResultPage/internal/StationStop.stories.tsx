import type { Meta, StoryObj } from "@storybook/react";

import { createDatetime } from "@/lib/utils";

import { Station } from "../types";
import { StationStop } from "./StationStop";

const meta: Meta<typeof StationStop> = {
  title: "Deprecated/Domains/RouteSearch/SearchResultPage/Internal/StationStop",
  component: StationStop,
  parameters: {
    layout: "centered",
    chromatic: {
      disableSnapshot: true,
    },
  },
  tags: ["autodocs"],
  argTypes: {
    isFirst: { control: "boolean" },
    isLast: { control: "boolean" },
    showTransferArrow: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleStation: Station = {
  stationName: "中央公園",
  arrivalTime: "08:15",
  departureTime: "08:17",
  arrivalDatetime: createDatetime("08:15"),
  departureDatetime: createDatetime("08:17"),
  cost: 180,
};

export const FirstStation: Story = {
  args: {
    station: {
      stationName: "東駅",
      departureTime: "08:00",
      departureDatetime: createDatetime("08:00"),
      cost: 0,
    },
    isFirst: true,
    isLast: false,
    showTransferArrow: false,
  },
};

export const MiddleStation: Story = {
  args: {
    station: sampleStation,
    isFirst: false,
    isLast: false,
    showTransferArrow: false,
  },
};

export const LastStation: Story = {
  args: {
    station: {
      stationName: "市役所前",
      arrivalTime: "08:25",
      arrivalDatetime: createDatetime("08:25"),
      cost: 180,
    },
    isFirst: false,
    isLast: true,
    showTransferArrow: false,
  },
};

export const TransferStation: Story = {
  args: {
    station: {
      stationName: "中央公園",
      arrivalTime: "08:15",
      departureTime: "08:20",
      cost: 180,
      isTransfer: true,
    },
    isFirst: false,
    isLast: false,
    showTransferArrow: true,
  },
};

export const LongStationName: Story = {
  args: {
    station: {
      stationName: "あきた芸術劇場ミルハス・にぎわい交流館 AU 前",
      arrivalTime: "08:30",
      departureTime: "08:32",
      cost: 250,
    },
    isFirst: false,
    isLast: false,
    showTransferArrow: false,
  },
};

export const NoTimes: Story = {
  args: {
    station: {
      stationName: "大学病院",
      cost: 200,
    },
    isFirst: false,
    isLast: false,
    showTransferArrow: false,
  },
};
