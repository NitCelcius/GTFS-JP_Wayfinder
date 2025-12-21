import { extractRouteNumber } from "../extractor";
import type { RouteExtractionContext } from "../types";

describe("extractRouteNumber", () => {
  describe("Provider-specific extraction", () => {
    it("should use Akita Chuo Kotsu extractor for matching trip_id format", () => {
      const context: RouteExtractionContext = {
        trip_id: "平日_05時11分_系統6001",
        route_short_name: "都心循環線",
      };

      const result = extractRouteNumber(context);

      // Should extract "600" from trip_id, not use route_short_name
      expect(result).toBe("600");
    });

    it("should extract from trip_id even when other fields are present", () => {
      const context: RouteExtractionContext = {
        trip_id: "土日_12時30分_系統1234",
        route_short_name: "青葉台線",
        route_long_name: "青葉台線 Full Name",
      };

      const result = extractRouteNumber(context);

      expect(result).toBe("123");
    });
  });

  describe("Standard GTFS field fallbacks", () => {
    it("should fall back to route_short_name when no extractor matches", () => {
      const context: RouteExtractionContext = {
        trip_id: "trip_001_001",
        route_short_name: "都心循環線",
      };

      const result = extractRouteNumber(context);

      expect(result).toBe("都心循環線");
    });

    it("should fall back to route_long_name if route_short_name is not available", () => {
      const context: RouteExtractionContext = {
        trip_id: "trip_002_001",
        route_long_name: "青葉台線 Express",
      };

      const result = extractRouteNumber(context);

      expect(result).toBe("青葉台線 Express");
    });

    it("should prefer route_short_name over route_long_name", () => {
      const context: RouteExtractionContext = {
        trip_id: "trip_003_001",
        route_short_name: "R1",
        route_long_name: "Route 1 Long Name",
      };

      const result = extractRouteNumber(context);

      expect(result).toBe("R1");
    });
  });

  describe("Default fallback", () => {
    it("should use empty string as default fallback when all extraction attempts fail", () => {
      const context: RouteExtractionContext = {
        trip_id: "unknown_format",
      };

      const result = extractRouteNumber(context);

      expect(result).toBe("");
    });

    it("should support custom fallback value", () => {
      const context: RouteExtractionContext = {
        trip_id: "unknown",
      };

      const result = extractRouteNumber(context, "N/A");

      expect(result).toBe("N/A");
    });

    it("should use fallback when context only has irrelevant fields", () => {
      const context: RouteExtractionContext = {
        trip_id: "trip_999",
        route_id: "route_999",
        service_id: "weekday",
      };

      const result = extractRouteNumber(context);

      expect(result).toBe("");
    });

    it("should handle null values from API (filtering to undefined)", () => {
      // API returns string | null, but our types expect string | undefined
      // This test ensures runtime null handling works correctly
      const context = {
        trip_id: "trip_999",
        route_short_name: null,
        route_long_name: null,
      } as unknown as RouteExtractionContext;

      const result = extractRouteNumber(context);

      expect(result).toBe("");
    });

    it("should filter out empty strings", () => {
      const context: RouteExtractionContext = {
        trip_id: "trip_999",
        route_short_name: "",
        route_long_name: "",
      };

      const result = extractRouteNumber(context);

      expect(result).toBe("");
    });
  });

  describe("Complex scenarios", () => {
    it("should handle multiple GTFS fields with mixed availability", () => {
      const contexts: Array<{
        context: RouteExtractionContext;
        expected: string;
      }> = [
        // Akita format takes priority
        {
          context: {
            trip_id: "平日_系統6001",
            route_short_name: "Route 7",
            route_long_name: "Route 7 Long",
          },
          expected: "600",
        },
        // Falls back to route_short_name
        {
          context: {
            trip_id: "generic_trip",
            route_short_name: "Route 5",
            route_long_name: "Route 5 Long",
          },
          expected: "Route 5",
        },
        // Falls back to route_long_name
        {
          context: {
            trip_id: "generic_trip_2",
            route_long_name: "Route 8 Long",
          },
          expected: "Route 8 Long",
        },
        // Uses default fallback
        {
          context: {
            trip_id: "no_match",
          },
          expected: "",
        },
      ];

      contexts.forEach(({ context, expected }) => {
        expect(extractRouteNumber(context)).toBe(expected);
      });
    });
  });

  describe("Real-world usage patterns", () => {
    it("should handle typical Akita Chuo Kotsu data", () => {
      // Mock data based on the city mock from copilot instructions
      const trips = [
        {
          trip_id: "平日_05時11分_系統001",
          route_short_name: "都心循環線",
        },
        {
          trip_id: "平日_06時20分_系統002",
          route_short_name: "青葉台線",
        },
        {
          trip_id: "土日_08時00分_系統003",
          route_short_name: "文教医療線",
        },
      ];

      const results = trips.map((trip) => extractRouteNumber(trip));

      expect(results).toEqual(["001", "002", "003"]);
    });

    it("should handle generic GTFS data from other providers", () => {
      const trips = [
        {
          trip_id: "trip_monday_001",
          route_short_name: "Line A",
        },
        {
          trip_id: "trip_tuesday_002",
          route_long_name: "Line B Express",
        },
      ];

      const results = trips.map((trip) => extractRouteNumber(trip));

      expect(results).toEqual(["Line A", "Line B Express"]);
    });
  });
});
