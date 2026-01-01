import { RecentRouteSearch } from "../types";

export const mockRecentRoutes: RecentRouteSearch[] = [
  {
    id: "1",
    fromStopId: "1",
    toStopId: "2",
    fromStopName: "中央公園",
    toStopName: "東駅",
    searchedAt: "2時間前",
  },
  {
    id: "2",
    fromStopId: "3",
    toStopId: "4",
    fromStopName: "西口",
    toStopName: "南町",
    searchedAt: "昨日",
  },
  {
    id: "3",
    fromStopId: "10",
    toStopId: "11",
    fromStopName: "あきた芸術劇場ミルハス・にぎわい交流館 AU 前",
    toStopName: "大学病院",
    searchedAt: "3日前",
  },
];
