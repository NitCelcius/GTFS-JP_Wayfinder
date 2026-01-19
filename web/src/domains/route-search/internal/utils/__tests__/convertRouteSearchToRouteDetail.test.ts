import type { TravelOnceResponse } from "@/api/types.gen";

import { convertRouteSearchToRouteDetail } from "../convertRouteSearchToRouteDetail";

describe("convertRouteSearchToRouteDetail", () => {
  const baseTravelResponse: TravelOnceResponse = {
    trip_id: "trip-123",
    departure_time: "08:15:00",
    arrival_time: "09:00:00",
    departure_datetime: "2024-01-15T08:15:00",
    arrival_datetime: "2024-01-15T09:00:00",
    from_stop_id: "1001_01",
    to_stop_id: "2001_01",
    fare: 350,
  };

  it("should convert TravelOnceResponse to RouteOption format", () => {
    const result = convertRouteSearchToRouteDetail(
      baseTravelResponse,
      "東駅",
      "大学病院"
    );

    expect(result.id).toBe("trip-123");
    expect(result.name).toBe("東駅 → 大学病院");
    expect(result.departureTime).toBe("08:15");
    expect(result.arrivalTime).toBe("09:00");
    expect(result.transferCount).toBe(0);
    expect(result.fare).toBe(350);
    expect(result.totalCost).toBe(350);
    expect(result.relativeTimeUntilDeparture).toBeDefined();
  });

  it("should create two stations with correct names", () => {
    const result = convertRouteSearchToRouteDetail(
      baseTravelResponse,
      "中央公園",
      "市役所前"
    );

    expect(result.stations).toHaveLength(2);
    expect(result.stations[0].stationName).toBe("中央公園");
    expect(result.stations[1].stationName).toBe("市役所前");
  });

  it("should set departure info only on origin station", () => {
    const result = convertRouteSearchToRouteDetail(
      baseTravelResponse,
      "東駅",
      "大学病院"
    );

    // Origin station should have departure time but no arrival time
    expect(result.stations[0].departureTime).toBe("08:15");
    expect(result.stations[0].departureDatetime).toEqual(
      new Date("2024-01-15T08:15:00")
    );
    expect(result.stations[0].arrivalTime).toBeUndefined();
    expect(result.stations[0].arrivalDatetime).toBeUndefined();
  });

  it("should set arrival info and cost only on destination station", () => {
    const result = convertRouteSearchToRouteDetail(
      baseTravelResponse,
      "東駅",
      "大学病院"
    );

    // Destination station should have arrival time and cost but no departure time
    expect(result.stations[1].arrivalTime).toBe("09:00");
    expect(result.stations[1].arrivalDatetime).toEqual(
      new Date("2024-01-15T09:00:00")
    );
    expect(result.stations[1].cost).toBe(350);
    expect(result.stations[1].departureTime).toBeUndefined();
    expect(result.stations[1].departureDatetime).toBeUndefined();
  });

  it("should calculate duration correctly", () => {
    const result = convertRouteSearchToRouteDetail(
      baseTravelResponse,
      "東駅",
      "大学病院"
    );

    // 08:15 to 09:00 = 45 minutes
    expect(result.duration).toBe("45分");
  });

  it("should handle zero fare", () => {
    const travelWithZeroFare: TravelOnceResponse = {
      ...baseTravelResponse,
      fare: 0,
    };

    const result = convertRouteSearchToRouteDetail(
      travelWithZeroFare,
      "東駅",
      "大学病院"
    );

    expect(result.fare).toBe(0);
    expect(result.totalCost).toBe(0);
    expect(result.stations[1].cost).toBe(0);
  });

  it("should handle long station names", () => {
    const result = convertRouteSearchToRouteDetail(
      baseTravelResponse,
      "あきた芸術劇場ミルハス・にぎわい交流館 AU 前",
      "大学病院"
    );

    expect(result.stations[0].stationName).toBe(
      "あきた芸術劇場ミルハス・にぎわい交流館 AU 前"
    );
  });

  it("should create valid Date objects from datetime strings", () => {
    const result = convertRouteSearchToRouteDetail(
      baseTravelResponse,
      "東駅",
      "大学病院"
    );

    expect(result.stations[0].departureDatetime).toBeInstanceOf(Date);
    expect(result.stations[1].arrivalDatetime).toBeInstanceOf(Date);
    expect(result.stations[0].departureDatetime?.toISOString()).not.toContain(
      "Invalid"
    );
    expect(result.stations[1].arrivalDatetime?.toISOString()).not.toContain(
      "Invalid"
    );
  });

  it("should calculate relative time until departure", () => {
    // Create a departure time 10 minutes in the future
    const futureDate = new Date();
    futureDate.setMinutes(futureDate.getMinutes() + 10);

    const futureTravelResponse: TravelOnceResponse = {
      ...baseTravelResponse,
      departure_datetime: futureDate.toISOString(),
    };

    const result = convertRouteSearchToRouteDetail(
      futureTravelResponse,
      "東駅",
      "大学病院"
    );

    expect(result.relativeTimeUntilDeparture).toBeDefined();
    // Should contain "バス停発" for future departure
    expect(result.relativeTimeUntilDeparture).toContain("バス停発");
  });

  it("should handle past departure times", () => {
    // Create a departure time 10 minutes in the past
    const pastDate = new Date();
    pastDate.setMinutes(pastDate.getMinutes() - 10);

    const pastTravelResponse: TravelOnceResponse = {
      ...baseTravelResponse,
      departure_datetime: pastDate.toISOString(),
    };

    const result = convertRouteSearchToRouteDetail(
      pastTravelResponse,
      "東駅",
      "大学病院"
    );

    expect(result.relativeTimeUntilDeparture).toBeDefined();
    // Should contain "出発済み" for past departure
    expect(result.relativeTimeUntilDeparture).toContain("出発済み");
  });
});
