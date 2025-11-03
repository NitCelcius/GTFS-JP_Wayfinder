import { convertUpcomingBusToBusStopInfo } from "../converter";
import type { UpcomingBusEnrichedData, EnrichedTripData } from "../types";

/**
 * Test the bus selection logic
 * The "best" bus should be the next bus to arrive (earliest/soonest among future buses)
 * 
 * NOTE: The converter doesn't handle time-based filtering - that's done by the API via begin_time.
 * The converter only selects the earliest bus from whatever list is provided.
 * Real-time filtering (removing past buses) happens server-side.
 */
describe("convertUpcomingBusToBusStopInfo", () => {
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

  it("should select the next bus to arrive (earliest future bus)", () => {
    const mockData: UpcomingBusEnrichedData = {
      stop_id: "1021_01",
      buses: [
        createBus("trip1", "14:00:00", "A", "2025-11-01T14:00:00"),
        createBus("trip2", "15:00:00", "B", "2025-11-01T15:00:00"),
        createBus("trip3", "16:00:00", "C", "2025-11-01T16:00:00"),
      ],
    };

    // Use a reference time before all buses (13:00)
    const referenceTime = new Date("2025-11-01T13:00:00");

    const result = convertUpcomingBusToBusStopInfo(
      mockData,
      "Test Stop",
      undefined,
      undefined,
      undefined,
      referenceTime
    );

    console.log("Selected bus (sorted order):", result.nextBus);
    console.log("Current bus index:", result.currentBusIndex);

    // The next bus should be the first one (14:00 = earliest)
    expect(result.nextBus?.destination).toBe("Destination A");
    expect(result.currentBusIndex).toBe(0);
  });

  it("should select the earliest upcoming bus when buses are out of order", () => {
    const mockData: UpcomingBusEnrichedData = {
      stop_id: "1021_01",
      buses: [
        createBus("trip3", "16:00:00", "C", "2025-11-01T16:00:00"),
        createBus("trip1", "14:00:00", "A", "2025-11-01T14:00:00"),
        createBus("trip2", "15:00:00", "B", "2025-11-01T15:00:00"),
      ],
    };

    // Use a reference time before all buses (13:00)
    const referenceTime = new Date("2025-11-01T13:00:00");

    const result = convertUpcomingBusToBusStopInfo(
      mockData,
      "Test Stop",
      undefined,
      undefined,
      undefined,
      referenceTime
    );

    console.log("Selected bus (unsorted):", result.nextBus);
    console.log("Current bus index:", result.currentBusIndex);

    // Should select the earliest bus (14:00), which is at index 1
    expect(result.nextBus?.destination).toBe("Destination A");
    expect(result.currentBusIndex).toBe(1);
  });

  it("should select the single bus when only one is available", () => {
    const mockData: UpcomingBusEnrichedData = {
      stop_id: "1021_01",
      buses: [createBus("trip1", "14:00:00", "A", "2025-11-01T14:00:00")],
    };

    // Use a reference time before the bus (13:00)
    const referenceTime = new Date("2025-11-01T13:00:00");

    const result = convertUpcomingBusToBusStopInfo(
      mockData,
      "Test Stop",
      undefined,
      undefined,
      undefined,
      referenceTime
    );

    expect(result.nextBus?.destination).toBe("Destination A");
    expect(result.currentBusIndex).toBe(0);
  });

  it("should handle empty bus list gracefully", () => {
    const mockData: UpcomingBusEnrichedData = {
      stop_id: "1021_01",
      buses: [],
    };

    const result = convertUpcomingBusToBusStopInfo(
      mockData,
      "Test Stop",
      undefined,
      undefined,
      undefined
    );

    expect(result.nextBus).toBeUndefined();
    expect(result.currentBusIndex).toBe(-1);
  });

  describe("Time-sensitive scenarios (API should pre-filter via begin_time)", () => {
    it("should pick the 14:30 bus (next bus) when current time is 14:00", () => {
      // In real usage, the API would receive begin_time=14:00:00 and filter out earlier buses
      // So we only receive buses at or after 14:00
      const mockData: UpcomingBusEnrichedData = {
        stop_id: "1021_01",
        buses: [
          createBus("trip2", "14:30:00", "B", "2025-11-01T14:30:00"),
          createBus("trip3", "15:00:00", "C", "2025-11-01T15:00:00"),
          createBus("trip4", "23:00:00", "D", "2025-11-01T23:00:00"), // Last bus of the day
        ],
      };

      const result = convertUpcomingBusToBusStopInfo(
        mockData,
        "Test Stop",
        undefined,
        undefined,
        undefined
      );

      // Should pick 14:30 (earliest), NOT 23:00 (latest/last of day)
      expect(result.nextBus?.arrivalTime).toBe("14:30");
      expect(result.nextBus?.destination).toBe("Destination B");
    });

    it("should pick the 15:00 bus when current time is 14:00 and 14:30 already passed", () => {
      // API would receive begin_time=14:45:00 and filter accordingly
      const mockData: UpcomingBusEnrichedData = {
        stop_id: "1021_01",
        buses: [
          createBus("trip3", "15:00:00", "C", "2025-11-01T15:00:00"),
          createBus("trip4", "16:00:00", "D", "2025-11-01T16:00:00"),
          createBus("trip5", "23:00:00", "E", "2025-11-01T23:00:00"),
        ],
      };

      const result = convertUpcomingBusToBusStopInfo(
        mockData,
        "Test Stop",
        undefined,
        undefined,
        undefined
      );

      // Should pick 15:00 (earliest), NOT 23:00
      expect(result.nextBus?.arrivalTime).toBe("15:00");
      expect(result.nextBus?.destination).toBe("Destination C");
    });

    it("should never pick the last bus (23:00) if earlier buses exist", () => {
      const mockData: UpcomingBusEnrichedData = {
        stop_id: "1021_01",
        buses: [
          createBus("trip1", "14:00:00", "A", "2025-11-01T14:00:00"),
          createBus("trip2", "14:30:00", "B", "2025-11-01T14:30:00"),
          createBus("trip3", "15:00:00", "C", "2025-11-01T15:00:00"),
          createBus("trip4", "23:00:00", "D", "2025-11-01T23:00:00"), // Last bus
        ],
      };

      const result = convertUpcomingBusToBusStopInfo(
        mockData,
        "Test Stop",
        undefined,
        undefined,
        undefined
      );

      // Should ALWAYS pick the earliest (14:00), never the last (23:00)
      expect(result.nextBus?.arrivalTime).toBe("14:00");
      expect(result.nextBus?.destination).toBe("Destination A");
      expect(result.currentBusIndex).toBe(0);
    });

    it("should pick the last bus (23:00) when all buses have already passed", () => {
      // API would receive begin_time=23:20:00, but since there are no future buses,
      // it returns ALL buses (or the most recent ones)
      // In this case, we should show the last bus (23:00) that just passed
      const mockData: UpcomingBusEnrichedData = {
        stop_id: "1021_01",
        buses: [
          createBus("trip1", "14:00:00", "A", "2025-11-01T14:00:00"),
          createBus("trip2", "14:30:00", "B", "2025-11-01T14:30:00"),
          createBus("trip3", "15:00:00", "C", "2025-11-01T15:00:00"),
          createBus("trip4", "23:00:00", "D", "2025-11-01T23:00:00"), // Last bus (already passed)
        ],
      };

      // Simulate current time as 23:20 (20 minutes after the last bus)
      const currentTime = new Date("2025-11-01T23:20:00");

      const result = convertUpcomingBusToBusStopInfo(
        mockData,
        "Test Stop",
        undefined,
        undefined,
        undefined,
        currentTime
      );

      // Should pick 23:00 (the last/most recent) when all buses have passed
      expect(result.nextBus?.arrivalTime).toBe("23:00");
      expect(result.nextBus?.destination).toBe("Destination D");
      expect(result.currentBusIndex).toBe(3);
    });
  });
});

