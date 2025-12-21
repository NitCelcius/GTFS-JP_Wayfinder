import type { TripDetails } from "@/domains/route-search/SearchResultPage/types";
import { createDatetime } from "@/lib/utils";

// Simple mock trip details with generic station names (hoge, fuga, piyo)
// For realistic city data, use mockTripDetails from mockData.ts
export const mockSimpleTripDetails: TripDetails = {
  fromStation: "hoge駅",
  toStation: "fuga駅",
  searchDateTime: "12:34",
  selectedRouteId: "route1",
  routes: [
    {
      id: "route1",
      name: "行き方1",
      departureTime: "12:34",
      arrivalTime: "14:30",
      duration: "1時間57分",
      transferCount: 1,
      totalCost: 450,
      stations: [
        {
          stationName: "hoge駅",
          departureTime: "12:34",
          departureDatetime: createDatetime("12:34"),
          cost: 0,
        },
        {
          stationName: "piyo駅",
          arrivalTime: "13:30",
          departureTime: "13:40",
          arrivalDatetime: createDatetime("13:30"),
          departureDatetime: createDatetime("13:40"),
          cost: 120,
        },
        {
          stationName: "fuga駅",
          arrivalTime: "14:30",
          arrivalDatetime: createDatetime("14:30"),
          cost: 330,
        },
      ],
    },
    {
      id: "route2",
      name: "行き方2",
      departureTime: "12:45",
      arrivalTime: "15:15",
      duration: "2時間30分",
      transferCount: 2,
      totalCost: 520,
      stations: [
        {
          stationName: "hoge駅",
          departureTime: "12:45",
          departureDatetime: createDatetime("12:45"),
          cost: 0,
        },
        {
          stationName: "temp駅",
          arrivalTime: "13:15",
          departureTime: "13:25",
          arrivalDatetime: createDatetime("13:15"),
          departureDatetime: createDatetime("13:25"),
          cost: 150,
        },
        {
          stationName: "middle駅",
          arrivalTime: "14:30",
          departureTime: "14:40",
          arrivalDatetime: createDatetime("14:30"),
          departureDatetime: createDatetime("14:40"),
          cost: 200,
        },
        {
          stationName: "fuga駅",
          arrivalTime: "15:15",
          arrivalDatetime: createDatetime("15:15"),
          cost: 170,
        },
      ],
    },
  ],
};

export default mockSimpleTripDetails;
