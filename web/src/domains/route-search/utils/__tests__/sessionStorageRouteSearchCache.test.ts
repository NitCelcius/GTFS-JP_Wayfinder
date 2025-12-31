import type { RouteSearchResult } from "@/types";

import {
  cacheRouteSearchResult,
  clearCachedRouteSearchResult,
  getCachedRouteSearchResult,
} from "../sessionStorageRouteSearchCache";

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
  writable: true,
});

describe("sessionStorageRouteSearchCache", () => {
  const mockRouteSearchResult: RouteSearchResult = {
    travels: [
      {
        trip_id: "trip-001",
        departure_time: "08:00",
        arrival_time: "08:45",
        departure_datetime: "2024-01-01T08:00:00",
        arrival_datetime: "2024-01-01T08:45:00",
        from_stop_id: "stop1",
        to_stop_id: "stop2",
        fare: 200,
      },
    ],
    originStopName: "東駅",
    destinationStopName: "大学病院",
    searchTime: "08:00",
  };

  beforeEach(() => {
    mockSessionStorage.clear();
    jest.clearAllMocks();
  });

  describe("cacheRouteSearchResult", () => {
    it("should store route search result in sessionStorage", () => {
      cacheRouteSearchResult(mockRouteSearchResult, "stop1", "stop2");

      expect(mockSessionStorage.setItem).toHaveBeenCalled();
      const cachedData = JSON.parse(
        mockSessionStorage.getItem("routeSearch:stop1:stop2") || "{}"
      );
      expect(cachedData.result).toEqual(mockRouteSearchResult);
      expect(cachedData.timestamp).toBeDefined();
    });

    it("should handle storage errors gracefully", () => {
      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      mockSessionStorage.setItem.mockImplementationOnce(() => {
        throw new Error("Storage quota exceeded");
      });

      expect(() =>
        cacheRouteSearchResult(mockRouteSearchResult, "stop1", "stop2")
      ).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Failed to cache route search result:",
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe("getCachedRouteSearchResult", () => {
    it("should retrieve cached result within expiration time", () => {
      cacheRouteSearchResult(mockRouteSearchResult, "stop1", "stop2");

      const result = getCachedRouteSearchResult("stop1", "stop2");

      expect(result).toEqual(mockRouteSearchResult);
    });

    it("should return null for non-existent cache", () => {
      const result = getCachedRouteSearchResult("nonexistent1", "nonexistent2");

      expect(result).toBeNull();
    });

    it("should return null and remove expired cache", () => {
      const expiredTimestamp = Date.now() - 6 * 60 * 1000; // 6 minutes ago
      const cacheKey = "routeSearch:stop1:stop2";
      mockSessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          result: mockRouteSearchResult,
          timestamp: expiredTimestamp,
        })
      );

      const result = getCachedRouteSearchResult(
        "stop1",
        "stop2",
        5 * 60 * 1000
      );

      expect(result).toBeNull();
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(cacheKey);
    });

    it("should validate cache data structure", () => {
      const cacheKey = "routeSearch:stop1:stop2";

      // Invalid: missing travels
      mockSessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          result: { originStopName: "東駅", destinationStopName: "大学病院" },
          timestamp: Date.now(),
        })
      );
      expect(getCachedRouteSearchResult("stop1", "stop2")).toBeNull();

      // Invalid: empty travels array
      mockSessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          result: {
            travels: [],
            originStopName: "東駅",
            destinationStopName: "大学病院",
          },
          timestamp: Date.now(),
        })
      );
      expect(getCachedRouteSearchResult("stop1", "stop2")).toBeNull();

      // Invalid: travel missing trip_id
      mockSessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          result: {
            travels: [
              {
                departure_time: "08:00",
                arrival_time: "08:45",
                departure_datetime: "2024-01-01T08:00:00",
                arrival_datetime: "2024-01-01T08:45:00",
              },
            ],
            originStopName: "東駅",
            destinationStopName: "大学病院",
          },
          timestamp: Date.now(),
        })
      );
      expect(getCachedRouteSearchResult("stop1", "stop2")).toBeNull();

      // Valid cache
      cacheRouteSearchResult(mockRouteSearchResult, "stop1", "stop2");
      expect(getCachedRouteSearchResult("stop1", "stop2")).toEqual(
        mockRouteSearchResult
      );
    });

    it("should handle malformed JSON gracefully", () => {
      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      const cacheKey = "routeSearch:stop1:stop2";
      mockSessionStorage.setItem(cacheKey, "invalid json{");

      const result = getCachedRouteSearchResult("stop1", "stop2");

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it("should validate timestamp is a number", () => {
      const cacheKey = "routeSearch:stop1:stop2";
      mockSessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          result: mockRouteSearchResult,
          timestamp: "not-a-number",
        })
      );

      const result = getCachedRouteSearchResult("stop1", "stop2");

      expect(result).toBeNull();
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(cacheKey);
    });
  });

  describe("clearCachedRouteSearchResult", () => {
    it("should remove cached result", () => {
      cacheRouteSearchResult(mockRouteSearchResult, "stop1", "stop2");

      clearCachedRouteSearchResult("stop1", "stop2");

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        "routeSearch:stop1:stop2"
      );
      expect(getCachedRouteSearchResult("stop1", "stop2")).toBeNull();
    });

    it("should handle errors gracefully", () => {
      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      mockSessionStorage.removeItem.mockImplementationOnce(() => {
        throw new Error("Storage error");
      });

      expect(() =>
        clearCachedRouteSearchResult("stop1", "stop2")
      ).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe("cache key generation", () => {
    it("should use different keys for different stop combinations", () => {
      cacheRouteSearchResult(mockRouteSearchResult, "stop1", "stop2");
      cacheRouteSearchResult(mockRouteSearchResult, "stop2", "stop1");

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        "routeSearch:stop1:stop2",
        expect.any(String)
      );
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        "routeSearch:stop2:stop1",
        expect.any(String)
      );
    });
  });
});
