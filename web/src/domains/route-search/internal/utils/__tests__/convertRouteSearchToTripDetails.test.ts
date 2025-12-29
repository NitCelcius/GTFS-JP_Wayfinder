import type { RouteSearchResult } from "@/types";

import { convertRouteSearchToTripDetails } from "../convertRouteSearchToTripDetails";

describe("convertRouteSearchToTripDetails", () => {
  it("should correctly calculate total fare for single segment route", () => {
    const result: RouteSearchResult = {
      travels: [
        {
          trip_id: "trip-1",
          departure_time: "08:00:00",
          arrival_time: "08:30:00",
          departure_datetime: "2024-01-01T08:00:00",
          arrival_datetime: "2024-01-01T08:30:00",
          from_stop_id: "1021_01",
          to_stop_id: "3109_01",
          fare: 520,
        },
      ],
      originStopName: "秋田駅東口",
      destinationStopName: "イオンモール秋田",
      searchTime: "08:00:00",
    };

    const tripDetails = convertRouteSearchToTripDetails(result);

    expect(tripDetails.routes).toHaveLength(1);
    expect(tripDetails.routes[0].fare).toBe(520);
    expect(tripDetails.routes[0].totalCost).toBe(520);
    expect(tripDetails.routes[0].transferCount).toBe(0);
    expect(tripDetails.routes[0].stations).toHaveLength(2);
    expect(tripDetails.routes[0].stations[0].stationName).toBe("秋田駅東口");
    expect(tripDetails.routes[0].stations[1].stationName).toBe(
      "イオンモール秋田"
    );
  });

  it("should correctly sum fares for multi-segment route with transfers", () => {
    // Simulate route: 1021_01 -> 4075_02 -> 3109_01 (requires transfer)
    const result: RouteSearchResult = {
      travels: [
        {
          trip_id: "trip-1",
          departure_time: "08:00:00",
          arrival_time: "08:20:00",
          departure_datetime: "2024-01-01T08:00:00",
          arrival_datetime: "2024-01-01T08:20:00",
          from_stop_id: "1021_01",
          to_stop_id: "4075_02",
          fare: 310,
        },
        {
          trip_id: "trip-2",
          departure_time: "09:00:00",
          arrival_time: "09:30:00",
          departure_datetime: "2024-01-01T09:00:00",
          arrival_datetime: "2024-01-01T09:30:00",
          from_stop_id: "4075_02",
          to_stop_id: "3109_01",
          fare: 580,
        },
      ],
      originStopName: "秋田駅東口",
      destinationStopName: "イオンモール秋田",
      searchTime: "08:00:00",
    };

    const tripDetails = convertRouteSearchToTripDetails(result);

    // Should combine into a single route
    expect(tripDetails.routes).toHaveLength(1);

    const route = tripDetails.routes[0];

    // Total fare should be sum of all segments: 310 + 580 = 890
    expect(route.fare).toBe(890);
    expect(route.totalCost).toBe(890);

    // Should correctly count transfers
    expect(route.transferCount).toBe(1);

    // Departure should be from first segment, arrival from last
    expect(route.departureTime).toBe("08:00:00");
    expect(route.arrivalTime).toBe("09:30:00");

    // Should have 3 stations: origin, transfer point, destination
    expect(route.stations).toHaveLength(3);
    expect(route.stations[0].stationName).toBe("秋田駅東口");
    expect(route.stations[0].departureTime).toBe("08:00:00");

    // Transfer point should have both arrival and departure times
    expect(route.stations[1].arrivalTime).toBe("08:20:00");
    expect(route.stations[1].departureTime).toBe("09:00:00");
    expect(route.stations[1].isTransfer).toBe(true);

    expect(route.stations[2].stationName).toBe("イオンモール秋田");
    expect(route.stations[2].arrivalTime).toBe("09:30:00");
  });

  it("should handle empty travels array", () => {
    const result: RouteSearchResult = {
      travels: [],
      originStopName: "秋田駅東口",
      destinationStopName: "イオンモール秋田",
      searchTime: "08:00:00",
    };

    const tripDetails = convertRouteSearchToTripDetails(result);

    expect(tripDetails.routes).toHaveLength(0);
  });

  it("should handle route with three segments (two transfers)", () => {
    const result: RouteSearchResult = {
      travels: [
        {
          trip_id: "trip-1",
          departure_time: "08:00:00",
          arrival_time: "08:15:00",
          departure_datetime: "2024-01-01T08:00:00",
          arrival_datetime: "2024-01-01T08:15:00",
          from_stop_id: "stop-a",
          to_stop_id: "stop-b",
          fare: 170,
        },
        {
          trip_id: "trip-2",
          departure_time: "08:30:00",
          arrival_time: "08:45:00",
          departure_datetime: "2024-01-01T08:30:00",
          arrival_datetime: "2024-01-01T08:45:00",
          from_stop_id: "stop-b",
          to_stop_id: "stop-c",
          fare: 200,
        },
        {
          trip_id: "trip-3",
          departure_time: "09:00:00",
          arrival_time: "09:20:00",
          departure_datetime: "2024-01-01T09:00:00",
          arrival_datetime: "2024-01-01T09:20:00",
          from_stop_id: "stop-c",
          to_stop_id: "stop-d",
          fare: 150,
        },
      ],
      originStopName: "出発地",
      destinationStopName: "目的地",
      searchTime: "08:00:00",
    };

    const tripDetails = convertRouteSearchToTripDetails(result);

    expect(tripDetails.routes).toHaveLength(1);

    const route = tripDetails.routes[0];

    // Total fare: 170 + 200 + 150 = 520
    expect(route.fare).toBe(520);
    expect(route.totalCost).toBe(520);

    // Two transfers
    expect(route.transferCount).toBe(2);

    // 4 stations: origin + 2 transfer points + destination
    expect(route.stations).toHaveLength(4);

    // Check transfer markers
    expect(route.stations[1].isTransfer).toBe(true);
    expect(route.stations[2].isTransfer).toBe(true);
    expect(route.stations[3].isTransfer).toBeUndefined();
  });

  it("should detect walk transfers (platform code requires API fetch)", () => {
    // Simulate route: akita-eki_01 -> WALK_TRANSFER to akita-eki_02 -> destination
    // Walk transfers occur between stops with same display name but different platforms
    // Platform codes should be fetched from API's GET /stops/{stop_id} → platform_code
    const result: RouteSearchResult = {
      travels: [
        {
          trip_id: "trip-1",
          departure_time: "10:00:00",
          arrival_time: "10:15:00",
          departure_datetime: "2024-01-01T10:00:00",
          arrival_datetime: "2024-01-01T10:15:00",
          from_stop_id: "akita-eki_01",
          to_stop_id: "akita-eki_01",
          fare: 200,
        },
        {
          // Walk transfer segment - same station name, different platform
          trip_id: "WALK_TRANSFER",
          departure_time: "10:15:00",
          arrival_time: "10:15:00",
          departure_datetime: "2024-01-01T10:15:00",
          arrival_datetime: "2024-01-01T10:15:00",
          from_stop_id: "akita-eki_01",
          to_stop_id: "akita-eki_02",
          fare: 0,
          is_walk_transfer: true,
        },
        {
          trip_id: "trip-2",
          departure_time: "10:20:00",
          arrival_time: "10:45:00",
          departure_datetime: "2024-01-01T10:20:00",
          arrival_datetime: "2024-01-01T10:45:00",
          from_stop_id: "akita-eki_02",
          to_stop_id: "ion-mall_01",
          fare: 350,
        },
      ],
      originStopName: "秋田駅東口",
      destinationStopName: "イオンモール秋田",
      searchTime: "10:00:00",
    };

    const tripDetails = convertRouteSearchToTripDetails(result);

    expect(tripDetails.routes).toHaveLength(1);

    const route = tripDetails.routes[0];

    // Total fare: 200 + 0 + 350 = 550
    expect(route.fare).toBe(550);

    // Walk transfers should not count toward transfer count
    // Only bus-to-bus transfers count (2 bus segments = 1 transfer)
    expect(route.transferCount).toBe(1);

    // Should have 4 stations including walk transfer stops
    expect(route.stations).toHaveLength(4);

    // First station (arrival at first bus stop, where we get off to transfer)
    // This should be marked as walk transfer because next segment is walk transfer
    expect(route.stations[1].isTransfer).toBe(true);
    expect(route.stations[1].isWalkTransfer).toBe(true);
    // Platform code requires fetching from API - not implemented in this converter
    // Future: Call GET /stops/akita-eki_02 to get platform_code field
    expect(route.stations[1].platformCode).toBeUndefined();

    // Second transfer point (walk transfer arrival at new platform)
    expect(route.stations[2].isTransfer).toBe(true);
  });

  it("should not mark regular transfers as walk transfers", () => {
    const result: RouteSearchResult = {
      travels: [
        {
          trip_id: "trip-1",
          departure_time: "08:00:00",
          arrival_time: "08:20:00",
          departure_datetime: "2024-01-01T08:00:00",
          arrival_datetime: "2024-01-01T08:20:00",
          from_stop_id: "stop-a",
          to_stop_id: "stop-b",
          fare: 310,
        },
        {
          trip_id: "trip-2",
          departure_time: "08:30:00",
          arrival_time: "08:50:00",
          departure_datetime: "2024-01-01T08:30:00",
          arrival_datetime: "2024-01-01T08:50:00",
          from_stop_id: "stop-b",
          to_stop_id: "stop-c",
          fare: 200,
        },
      ],
      originStopName: "出発地",
      destinationStopName: "目的地",
      searchTime: "08:00:00",
    };

    const tripDetails = convertRouteSearchToTripDetails(result);
    const route = tripDetails.routes[0];

    // Regular transfer should not have walk transfer flag
    expect(route.stations[1].isTransfer).toBe(true);
    expect(route.stations[1].isWalkTransfer).toBeUndefined();
    expect(route.stations[1].platformCode).toBeUndefined();
  });
});
