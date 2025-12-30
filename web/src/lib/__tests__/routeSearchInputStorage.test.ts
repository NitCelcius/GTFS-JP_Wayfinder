import {
  clearRouteSearchInputs,
  getRouteSearchInputs,
  saveRouteSearchInputs,
} from "../routeSearchInputStorage";

describe("routeSearchInputStorage", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe("saveRouteSearchInputs", () => {
    it("should save route search inputs to localStorage", () => {
      const inputs = {
        originStopId: "stop1",
        destinationStopId: "stop2",
        originStopName: "東駅",
        destinationStopName: "中央公園",
        originCandidateStopIds: ["stop1", "stop1-1"],
        destinationCandidateStopIds: ["stop2", "stop2-1"],
      };

      saveRouteSearchInputs(inputs);

      const stored = localStorage.getItem("gtfs-route-search-inputs");
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

    it("should update timestamp on each save", () => {
      const inputs = {
        originStopId: "stop1",
        destinationStopId: "stop2",
        originStopName: "東駅",
        destinationStopName: "中央公園",
        originCandidateStopIds: ["stop1"],
        destinationCandidateStopIds: ["stop2"],
      };

      saveRouteSearchInputs(inputs);
      const stored1 = localStorage.getItem("gtfs-route-search-inputs");
      const parsed1 = JSON.parse(stored1!);
      const timestamp1 = parsed1.timestamp;

      // Wait a bit and save again
      jest.advanceTimersByTime(100);
      saveRouteSearchInputs(inputs);

      const stored2 = localStorage.getItem("gtfs-route-search-inputs");
      const parsed2 = JSON.parse(stored2!);
      const timestamp2 = parsed2.timestamp;

      expect(timestamp2).toBeGreaterThanOrEqual(timestamp1);
    });
  });

  describe("getRouteSearchInputs", () => {
    it("should return null when no data is stored", () => {
      const result = getRouteSearchInputs();
      expect(result).toBeNull();
    });

    it("should retrieve saved inputs within 1 hour", () => {
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

    it("should return null when data is older than 1 hour", () => {
      // Manually create expired data
      const expiredState = {
        originStopId: "stop1",
        destinationStopId: "stop2",
        originStopName: "東駅",
        destinationStopName: "中央公園",
        originCandidateStopIds: ["stop1"],
        destinationCandidateStopIds: ["stop2"],
        timestamp: Date.now() - 61 * 60 * 1000, // 61 minutes ago
      };

      localStorage.setItem(
        "gtfs-route-search-inputs",
        JSON.stringify(expiredState)
      );

      const result = getRouteSearchInputs();
      expect(result).toBeNull();

      // Should also clear the expired data
      const stored = localStorage.getItem("gtfs-route-search-inputs");
      expect(stored).toBeNull();
    });

    it("should return data when exactly at 1 hour boundary", () => {
      // Data that is exactly 1 hour old should still be returned
      const boundaryState = {
        originStopId: "stop1",
        destinationStopId: "stop2",
        originStopName: "東駅",
        destinationStopName: "中央公園",
        originCandidateStopIds: ["stop1"],
        destinationCandidateStopIds: ["stop2"],
        timestamp: Date.now() - 60 * 60 * 1000, // Exactly 1 hour ago
      };

      localStorage.setItem(
        "gtfs-route-search-inputs",
        JSON.stringify(boundaryState)
      );

      const result = getRouteSearchInputs();
      expect(result).not.toBeNull();
    });

    it("should handle invalid JSON gracefully", () => {
      localStorage.setItem("gtfs-route-search-inputs", "invalid json");

      const result = getRouteSearchInputs();
      expect(result).toBeNull();
    });
  });

  describe("clearRouteSearchInputs", () => {
    it("should remove saved inputs from localStorage", () => {
      const inputs = {
        originStopId: "stop1",
        destinationStopId: "stop2",
        originStopName: "東駅",
        destinationStopName: "中央公園",
        originCandidateStopIds: ["stop1"],
        destinationCandidateStopIds: ["stop2"],
      };

      saveRouteSearchInputs(inputs);
      expect(localStorage.getItem("gtfs-route-search-inputs")).not.toBeNull();

      clearRouteSearchInputs();
      expect(localStorage.getItem("gtfs-route-search-inputs")).toBeNull();
    });

    it("should not throw error when nothing is stored", () => {
      expect(() => clearRouteSearchInputs()).not.toThrow();
    });
  });
});
