import type { TripDetails } from "@/components/page/SearchResultPage/types";

export const mockTripDetails: TripDetails = {
  fromStation: "hoge駅",
  toStation: "fuga駅",
  searchDateTime: "12:34",
  selectedRouteId: "route1",
  routes: [
    {
      id: "route1",
      name: "経路1",
      departureTime: "12:34",
      arrivalTime: "14:30",
      duration: "1時間57分",
      transferCount: 1,
      totalCost: 450,
      stations: [
        {
          stationName: "hoge駅",
          departureTime: "12:34",
          cost: 0,
        },
        {
          stationName: "piyo駅",
          arrivalTime: "13:30",
          departureTime: "13:40",
          cost: 120,
        },
        {
          stationName: "fuga駅",
          arrivalTime: "14:30",
          cost: 330,
        },
      ],
    },
    {
      id: "route2",
      name: "経路2",
      departureTime: "12:45",
      arrivalTime: "15:15",
      duration: "2時間30分",
      transferCount: 2,
      totalCost: 520,
      stations: [
        {
          stationName: "hoge駅",
          departureTime: "12:45",
          cost: 0,
        },
        {
          stationName: "temp駅",
          arrivalTime: "13:15",
          departureTime: "13:25",
          cost: 150,
        },
        {
          stationName: "middle駅",
          arrivalTime: "14:30",
          departureTime: "14:40",
          cost: 200,
        },
        {
          stationName: "fuga駅",
          arrivalTime: "15:15",
          cost: 170,
        },
      ],
    },
  ],
};

export default mockTripDetails;
