import {
  convertBusesToBusInfoList,
  convertTripToBusInfo,
  formatTime,
} from "../converter";
import type { EnrichedTripData } from "../types";

/**
 * Test pure conversion functions
 * These tests verify that converters correctly transform API data to domain types
 * without any selection logic
 */
describe("Converter functions", () => {
  // Helper function to create mock bus data
  function createBus(
    tripId: string,
    arrivalTime: string,
    destination: string,
    arrivalDatetime: string
  ): EnrichedTripData {
    return {
      trip_id: tripId,
      arrival_time: arrivalTime,
      departure_time: arrivalTime,
      arrival_datetime: arrivalDatetime,
      departure_datetime: arrivalDatetime,
      route_name: `Route ${destination}`,
      destination_display_name: `Destination ${destination}`,
    };
  }

  describe("formatTime", () => {
    it("should convert HH:MM:SS to HH:MM format", () => {
      expect(formatTime("14:30:00")).toBe("14:30");
      expect(formatTime("09:05:00")).toBe("09:05");
      expect(formatTime("23:59:00")).toBe("23:59");
    });
  });

  describe("convertTripToBusInfo", () => {
    it("should convert EnrichedTripData to BusInfo", () => {
      const trip = createBus("trip1", "14:00:00", "A", "2025-11-01T14:00:00");
      const result = convertTripToBusInfo(trip);

      expect(result.line).toBe("Route A");
      expect(result.destination).toBe("Destination A");
      expect(result.arrivalTime).toBe("14:00");
      expect(result.status).toBe("当バス停着");
    });

    it("should handle missing route and destination names", () => {
      const trip: EnrichedTripData = {
        trip_id: "trip1",
        arrival_time: "14:00:00",
        departure_time: "14:00:00",
        arrival_datetime: "2025-11-01T14:00:00",
        departure_datetime: "2025-11-01T14:00:00",
      };
      const result = convertTripToBusInfo(trip);

      // Empty string fallback for missing route
      expect(result.line).toBe("");
      expect(result.destination).toBe("不明");
    });

    it("should parse arrival datetime correctly", () => {
      const trip = createBus("trip1", "14:00:00", "A", "2025-11-01T14:00:00");
      const result = convertTripToBusInfo(trip);

      expect(result.arrivalDatetime).toEqual(new Date("2025-11-01T14:00:00"));
    });

    it("should extract route number from Akita Chuo Kotsu trip_id format", () => {
      const trip: EnrichedTripData = {
        trip_id: "平日_05時11分_系統6001",
        arrival_time: "14:00:00",
        departure_time: "14:00:00",
        arrival_datetime: "2025-11-01T14:00:00",
        departure_datetime: "2025-11-01T14:00:00",
        route_name: "都心循環線",
        destination_display_name: "市役所前",
      };
      const result = convertTripToBusInfo(trip);

      // Should extract from trip_id, not use route_name
      expect(result.line).toBe("600");
      expect(result.tripId).toBe("平日_05時11分_系統6001");
    });

    it("should fallback to route_name when trip_id doesn't match any extractor", () => {
      const trip: EnrichedTripData = {
        trip_id: "trip_001_001",
        arrival_time: "14:00:00",
        departure_time: "14:00:00",
        arrival_datetime: "2025-11-01T14:00:00",
        departure_datetime: "2025-11-01T14:00:00",
        route_name: "都心循環線",
        destination_display_name: "市役所前",
      };
      const result = convertTripToBusInfo(trip);

      // Should fall back to route_name (mapped to route_short_name)
      expect(result.line).toBe("都心循環線");
    });
  });

  describe("convertBusesToBusInfoList", () => {
    it("should convert array of buses to array of BusInfo", () => {
      const buses = [
        createBus("trip1", "14:00:00", "A", "2025-11-01T14:00:00"),
        createBus("trip2", "15:00:00", "B", "2025-11-01T15:00:00"),
        createBus("trip3", "16:00:00", "C", "2025-11-01T16:00:00"),
      ];

      const result = convertBusesToBusInfoList(buses);

      expect(result).toHaveLength(3);
      expect(result[0].destination).toBe("Destination A");
      expect(result[1].destination).toBe("Destination B");
      expect(result[2].destination).toBe("Destination C");
    });

    it("should handle empty bus list", () => {
      const result = convertBusesToBusInfoList([]);
      expect(result).toEqual([]);
    });

    it("should preserve bus order from input array", () => {
      const buses = [
        createBus("trip3", "16:00:00", "C", "2025-11-01T16:00:00"),
        createBus("trip1", "14:00:00", "A", "2025-11-01T14:00:00"),
        createBus("trip2", "15:00:00", "B", "2025-11-01T15:00:00"),
      ];

      const result = convertBusesToBusInfoList(buses);

      expect(result[0].destination).toBe("Destination C");
      expect(result[1].destination).toBe("Destination A");
      expect(result[2].destination).toBe("Destination B");
    });
  });
});
