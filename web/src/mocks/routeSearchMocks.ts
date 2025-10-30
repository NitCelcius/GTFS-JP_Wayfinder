import type { TimedTravelResponse, TravelOnceResponse } from "@/api/types.gen";
import type { RouteSearchResult } from "@/types";

// Mock individual travel options
export const mockTravelOnceResponses: TravelOnceResponse[] = [
  {
    trip_id: "trip_001_001",
    departure_time: "08:00",
    arrival_time: "08:12",
    departure_datetime: "2021-01-01T08:00:00",
    arrival_datetime: "2021-01-01T08:12:00",
    from_stop_id: "higashi-eki",
    to_stop_id: "daigaku-byoin",
    fare: 150,
  },
  {
    trip_id: "trip_002_001",
    departure_time: "08:05",
    arrival_time: "08:30",
    departure_datetime: "2021-01-01T08:05:00",
    arrival_datetime: "2021-01-01T08:30:00",
    from_stop_id: "higashi-eki",
    to_stop_id: "daigaku-byoin",
    fare: 200,
  },
  {
    trip_id: "trip_003_001",
    departure_time: "07:55",
    arrival_time: "08:12",
    departure_datetime: "2021-01-01T07:55:00",
    arrival_datetime: "2021-01-01T08:12:00",
    from_stop_id: "higashi-eki",
    to_stop_id: "daigaku-byoin",
    fare: 180,
  },
];

// Mock API response
export const mockTimedTravelResponse: TimedTravelResponse = {
  travels: mockTravelOnceResponses,
};

// Mock domain result for UI components
export const mockRouteSearchResult: RouteSearchResult = {
  travels: mockTravelOnceResponses,
  originStopName: "東駅",
  destinationStopName: "大学病院",
  searchTime: "08:00",
};

// Mock result with no travels
export const mockEmptyRouteSearchResult: RouteSearchResult = {
  travels: [],
  originStopName: "東駅",
  destinationStopName: "存在しない停留所",
  searchTime: "08:00",
};

// Mock with single travel option
export const mockSingleRouteSearchResult: RouteSearchResult = {
  travels: [mockTravelOnceResponses[0]],
  originStopName: "東駅",
  destinationStopName: "大学病院",
  searchTime: "08:00",
};

// Mock for different origin/destination
export const mockAlternativeRouteSearchResult: RouteSearchResult = {
  travels: [
    {
      trip_id: "trip_004_001",
      departure_time: "09:15",
      arrival_time: "09:35",
      departure_datetime: "2021-01-01T09:15:00",
      arrival_datetime: "2021-01-01T09:35:00",
      from_stop_id: "chuou-koen",
      to_stop_id: "miruhas-au",
      fare: 170,
    },
    {
      trip_id: "trip_005_001",
      departure_time: "09:30",
      arrival_time: "09:50",
      departure_datetime: "2021-01-01T09:30:00",
      arrival_datetime: "2021-01-01T09:50:00",
      from_stop_id: "chuou-koen",
      to_stop_id: "miruhas-au",
      fare: 170,
    },
  ],
  originStopName: "中央公園",
  destinationStopName: "あきた芸術劇場ミルハス・にぎわい交流館 AU 前",
  searchTime: "09:15",
};
