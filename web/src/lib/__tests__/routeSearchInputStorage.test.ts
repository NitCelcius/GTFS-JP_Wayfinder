import {
  clearRouteSearchInputs,
  getRouteSearchInputs,
  saveRouteSearchInputs,
} from "../routeSearchInputStorage";

describe("routeSearchInputStorage", () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  describe("saveRouteSearchInputs", () => {
    it("should save route search inputs to sessionStorage", () => {
      const inputs = {
        originStopId: "stop1",
        destinationStopId: "stop2",
        originStopName: "東駅",
        destinationStopName: "中央公園",
        originCandidateStopIds: ["stop1", "stop1-1"],
        destinationCandidateStopIds: ["stop2", "stop2-1"],
      };

      saveRouteSearchInputs(inputs);

      const stored = sessionStorage.getItem("gtfs-route-search-inputs");
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed.originStopId).toBe("stop1");
      expect(parsed.destinationStopId).toBe("stop2");
      expect(parsed.originStopName).toBe("東駅");
      expect(parsed.destinationStopName).toBe("中央公園");
      expect(parsed.originCandidateStopIds).toEqual(["stop1", "stop1-1"]);
      expect(parsed.destinationCandidateStopIds).toEqual(["stop2", "stop2-1"]);
      expect(parsed.timestamp).toBeDefined();
      expect(typeof parsed.timestamp).toBe("number");
    });

    it("should update timestamp on each save", async () => {
      const inputs = {
        originStopId: "stop1",
        destinationStopId: "stop2",
        originStopName: "東駅",
        destinationStopName: "中央公園",
        originCandidateStopIds: ["stop1"],
        destinationCandidateStopIds: ["stop2"],
      };

      saveRouteSearchInputs(inputs);
      const stored1 = sessionStorage.getItem("gtfs-route-search-inputs");
      const parsed1 = JSON.parse(stored1!);
      const timestamp1 = parsed1.timestamp;

      // Wait a bit with real delay to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10));
      saveRouteSearchInputs(inputs);

      const stored2 = sessionStorage.getItem("gtfs-route-search-inputs");
      const parsed2 = JSON.parse(stored2!);
      const timestamp2 = parsed2.timestamp;

      expect(timestamp2).toBeGreaterThan(timestamp1);
    });
  });

  describe("getRouteSearchInputs", () => {
    it("should return null when no data is stored", () => {
      const result = getRouteSearchInputs();
      expect(result).toBeNull();
    });

    it("should retrieve saved inputs within 5 minutes", () => {
      const inputs = {
        originStopId: "stop1",
        destinationStopId: "stop2",
        originStopName: "東駅",
        destinationStopName: "中央公園",
        originCandidateStopIds: ["stop1"],
        destinationCandidateStopIds: ["stop2"],
      };

      saveRouteSearchInputs(inputs);
      const result = getRouteSearchInputs();

      expect(result).not.toBeNull();
      expect(result?.originStopId).toBe("stop1");
      expect(result?.destinationStopId).toBe("stop2");
      expect(result?.originStopName).toBe("東駅");
      expect(result?.destinationStopName).toBe("中央公園");
      expect(result?.originCandidateStopIds).toEqual(["stop1"]);
      expect(result?.destinationCandidateStopIds).toEqual(["stop2"]);
    });

    it("should return null when data is older than 5 minutes", () => {
      // Mock current time
      const now = 1000000000000; // Fixed timestamp
      jest.spyOn(Date, "now").mockReturnValue(now);

      // Manually create expired data
      const expiredState = {
        originStopId: "stop1",
        destinationStopId: "stop2",
        originStopName: "東駅",
        destinationStopName: "中央公園",
        originCandidateStopIds: ["stop1"],
        destinationCandidateStopIds: ["stop2"],
        timestamp: now - 6 * 60 * 1000, // 6 minutes ago
      };

      sessionStorage.setItem(
        "gtfs-route-search-inputs",
        JSON.stringify(expiredState)
      );

      const result = getRouteSearchInputs();
      expect(result).toBeNull();

      // Should also clear the expired data
      const stored = sessionStorage.getItem("gtfs-route-search-inputs");
      expect(stored).toBeNull();

      // Restore Date.now()
      jest.restoreAllMocks();
    });

    it("should return data when exactly at 5 minute boundary", () => {
      // Mock current time
      const now = 1000000000000; // Fixed timestamp
      jest.spyOn(Date, "now").mockReturnValue(now);

      // Data that is exactly 5 minutes old should still be returned
      const boundaryState = {
        originStopId: "stop1",
        destinationStopId: "stop2",
        originStopName: "東駅",
        destinationStopName: "中央公園",
        originCandidateStopIds: ["stop1"],
        destinationCandidateStopIds: ["stop2"],
        timestamp: now - 5 * 60 * 1000, // Exactly 5 minutes ago
      };

      sessionStorage.setItem(
        "gtfs-route-search-inputs",
        JSON.stringify(boundaryState)
      );

      const result = getRouteSearchInputs();
      expect(result).not.toBeNull();

      // Restore Date.now()
      jest.restoreAllMocks();
    });

    it("should handle invalid JSON gracefully", () => {
      sessionStorage.setItem("gtfs-route-search-inputs", "invalid json");

      const result = getRouteSearchInputs();
      expect(result).toBeNull();
    });

    it("should return null for invalid data structure", () => {
      const invalidState = {
        originStopId: "stop1",
        // Missing required fields
        timestamp: Date.now(),
      };

      sessionStorage.setItem(
        "gtfs-route-search-inputs",
        JSON.stringify(invalidState)
      );

      const result = getRouteSearchInputs();
      expect(result).toBeNull();

      // Should also clear the invalid data
      const stored = sessionStorage.getItem("gtfs-route-search-inputs");
      expect(stored).toBeNull();
    });
  });

  describe("clearRouteSearchInputs", () => {
    it("should remove saved inputs from sessionStorage", () => {
      const inputs = {
        originStopId: "stop1",
        destinationStopId: "stop2",
        originStopName: "東駅",
        destinationStopName: "中央公園",
        originCandidateStopIds: ["stop1"],
        destinationCandidateStopIds: ["stop2"],
      };

      saveRouteSearchInputs(inputs);
      expect(sessionStorage.getItem("gtfs-route-search-inputs")).not.toBeNull();

      clearRouteSearchInputs();
      expect(sessionStorage.getItem("gtfs-route-search-inputs")).toBeNull();
    });

    it("should not throw error when nothing is stored", () => {
      expect(() => clearRouteSearchInputs()).not.toThrow();
    });
  });
});
