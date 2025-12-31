import type { Meta, StoryObj } from "@storybook/react";

import { RecentRouteSearch } from "../types";
import { RecentRouteItem } from "./RecentRouteSearches";

const meta: Meta<typeof RecentRouteItem> = {
  title: "Recent/Internal/RecentRouteItem",
  component: RecentRouteItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onSelect: { action: "routeSelected" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleRoute: RecentRouteSearch = {
  id: "1",
  fromStopId: "1",
  toStopId: "2",
  fromStopName: "中央公園",
  toStopName: "東駅",
  searchedAt: "2時間前",
};

export const Default: Story = {
  args: {
    route: sampleRoute,
    onSelect: (
      fromStopId: string,
      toStopId: string,
      fromStation: string,
      toStation: string
    ) => console.log("Selected:", fromStopId, toStopId, fromStation, toStation),
  },
};

export const LongStationNames: Story = {
  args: {
    route: {
      id: "2",
      fromStopId: "10",
      toStopId: "11",
      fromStopName: "あきた芸術劇場ミルハス・にぎわい交流館 AU 前",
      toStopName: "大学病院",
      searchedAt: "昨日",
    },
    onSelect: (
      fromStopId: string,
      toStopId: string,
      fromStation: string,
      toStation: string
    ) => console.log("Selected:", fromStopId, toStopId, fromStation, toStation),
  },
};

export const RecentTimestamp: Story = {
  args: {
    route: {
      id: "3",
      fromStopId: "5",
      toStopId: "6",
      fromStopName: "さくら通り",
      toStopName: "緑が丘",
      searchedAt: "5分前",
    },
    onSelect: (
      fromStopId: string,
      toStopId: string,
      fromStation: string,
      toStation: string
    ) => console.log("Selected:", fromStopId, toStopId, fromStation, toStation),
  },
};
