import { RecentBusStopSearch } from "../types";

export const mockRecentBusStops: RecentBusStopSearch[] = [
  {
    recordId: "rec-1",
    id: "1",
    name: "中央公園",
    distance: "120m",
    searchedAt: "2時間前",
  },
  {
    recordId: "rec-2",
    id: "2",
    name: "東駅",
    distance: "300m",
    searchedAt: "昨日",
  },
  {
    recordId: "rec-3",
    id: "3",
    name: "あきた芸術劇場ミルハス・にぎわい交流館 AU 前",
    distance: "500m",
    searchedAt: "3日前",
  },
  {
    recordId: "rec-4",
    id: "4",
    name: "西口",
    distance: "位置情報無効",
    searchedAt: "1週間前",
  },
];
