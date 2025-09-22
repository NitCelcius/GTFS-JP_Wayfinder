import type { TripDetails } from "@/components/page/SearchResultPage/types";

// Mock bus stops for the city (IDs are simple slugs)
export const mockBusStops = [
  { id: "chuou-koen", name: "中央公園" },
  { id: "shiyakusho-mae", name: "市役所前" },
  { id: "aobadai", name: "青葉台" },
  { id: "sakura-dori", name: "さくら通り" },
  { id: "midori-ga-oka", name: "緑が丘" },
  { id: "higashi-eki", name: "東駅" },
  { id: "nishi-guchi", name: "西口" },
  { id: "minami-machi", name: "南町" },
  { id: "kita-ko-mae", name: "北高前" },
  { id: "daigaku-byoin", name: "大学病院" },
  { id: "miruhas-au", name: "あきた芸術劇場ミルハス・にぎわい交流館 AU 前" },
];

// Mock lines (系統) connecting stops — lists use stop names for readability
export const mockLines = [
  {
    id: "001",
    name: "都心循環線",
    stops: ["東駅", "市役所前", "中央公園", "西口", "南町", "東駅"],
  },
  {
    id: "002",
    name: "青葉台線",
    stops: ["東駅", "さくら通り", "青葉台", "緑が丘"],
  },
  {
    id: "003",
    name: "文教医療線",
    stops: [
      "西口",
      "北高前",
      "大学病院",
      "あきた芸術劇場ミルハス・にぎわい交流館 AU 前",
    ],
  },
  {
    id: "004",
    name: "南北縦断線",
    stops: ["緑が丘", "中央公園", "さくら通り", "北高前", "大学病院"],
  },
];

// Hard-coded TripDetails (no generation logic)
export const mockTripDetails: TripDetails = {
  fromStation: "東駅",
  toStation: "大学病院",
  searchDateTime: new Date().toISOString(),
  selectedRouteId: "line-002",
  routes: [
    {
      id: "line-001",
      name: "都心循環線",
      departureTime: "08:00",
      arrivalTime: "08:12",
      duration: "12分",
      transferCount: 0,
      totalCost: 150,
      stations: [
        { stationName: "東駅", departureTime: "08:00" },
        {
          stationName: "市役所前",
          arrivalTime: "08:05",
          departureTime: "08:06",
        },
        {
          stationName: "中央公園",
          arrivalTime: "08:12",
          departureTime: "08:13",
        },
        { stationName: "西口", arrivalTime: "08:18", departureTime: "08:19" },
        { stationName: "南町", arrivalTime: "08:25", departureTime: "08:26" },
        { stationName: "東駅", arrivalTime: "08:35" },
      ],
    },
    {
      id: "line-002",
      name: "青葉台線",
      departureTime: "08:05",
      arrivalTime: "08:30",
      duration: "25分",
      transferCount: 0,
      totalCost: 200,
      stations: [
        { stationName: "東駅", departureTime: "08:05" },
        {
          stationName: "さくら通り",
          arrivalTime: "08:12",
          departureTime: "08:13",
        },
        { stationName: "青葉台", arrivalTime: "08:20", departureTime: "08:21" },
        { stationName: "緑が丘", arrivalTime: "08:30" },
      ],
    },
    {
      id: "line-003",
      name: "文教医療線",
      departureTime: "07:55",
      arrivalTime: "08:12",
      duration: "17分",
      transferCount: 0,
      totalCost: 180,
      stations: [
        { stationName: "西口", departureTime: "07:55" },
        { stationName: "北高前", arrivalTime: "08:02", departureTime: "08:03" },
        { stationName: "大学病院", arrivalTime: "08:12" },
        {
          stationName: "あきた芸術劇場ミルハス・にぎわい交流館 AU 前",
          arrivalTime: "08:20",
        },
      ],
    },
    {
      id: "line-004",
      name: "南北縦断線",
      departureTime: "09:00",
      arrivalTime: "09:40",
      duration: "40分",
      transferCount: 0,
      totalCost: 220,
      stations: [
        { stationName: "緑が丘", departureTime: "09:00" },
        {
          stationName: "中央公園",
          arrivalTime: "09:08",
          departureTime: "09:09",
        },
        {
          stationName: "さくら通り",
          arrivalTime: "09:18",
          departureTime: "09:19",
        },
        { stationName: "北高前", arrivalTime: "09:30", departureTime: "09:31" },
        { stationName: "大学病院", arrivalTime: "09:40" },
      ],
    },
  ],
};
export default mockTripDetails;
