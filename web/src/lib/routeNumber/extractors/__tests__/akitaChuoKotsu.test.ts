import type { RouteExtractionContext } from "../../types";
import { extractAkitaChuoKotsu } from "../akitaChuoKotsu";

describe("extractAkitaChuoKotsu", () => {
  describe("Successful extraction", () => {
    it("should extract 3-digit route number from trip_id with 系統 pattern", () => {
      const context: RouteExtractionContext = {
        trip_id: "平日_05時11分_系統6001",
      };

      const result = extractAkitaChuoKotsu(context);

      expect(result.routeNumber).toBe("600");
      expect(result.source).toBe("trip_id");
    });

    it("should handle different day types and times", () => {
      const contexts = [
        { trip_id: "土日_12時30分_系統1234" },
        { trip_id: "祝日_08時00分_系統4567" },
        { trip_id: "平日_23時59分_系統9999" },
      ];

      const results = contexts.map(extractAkitaChuoKotsu);

      expect(results[0].routeNumber).toBe("123");
      expect(results[1].routeNumber).toBe("456");
      expect(results[2].routeNumber).toBe("999");
    });

    it("should handle minimal format with just 系統 and digits", () => {
      const context: RouteExtractionContext = {
        trip_id: "系統001",
      };

      const result = extractAkitaChuoKotsu(context);

      expect(result.routeNumber).toBe("001");
      expect(result.source).toBe("trip_id");
    });
  });

  describe("Failed extraction", () => {
    it("should return null for non-matching trip_id formats", () => {
      const contexts: RouteExtractionContext[] = [
        { trip_id: "trip_123_001" },
        { trip_id: "unknown_format" },
        { trip_id: "abc123def" },
        { trip_id: "" },
      ];

      contexts.forEach((context) => {
        const result = extractAkitaChuoKotsu(context);
        expect(result.routeNumber).toBeNull();
        expect(result.source).toBe("trip_id");
      });
    });

    it("should return null if less than 3 digits after 系統", () => {
      const contexts = [
        { trip_id: "系統12" },
        { trip_id: "系統1" },
        { trip_id: "平日_系統99" },
      ];

      contexts.forEach((context) => {
        const result = extractAkitaChuoKotsu(context);
        expect(result.routeNumber).toBeNull();
      });
    });

    it("should return null even if route_short_name is provided", () => {
      const context: RouteExtractionContext = {
        trip_id: "non_matching_format",
        route_short_name: "Route 5",
      };

      const result = extractAkitaChuoKotsu(context);

      // Extractor only checks trip_id, doesn't use other fields
      expect(result.routeNumber).toBeNull();
    });
  });

  describe("Real-world examples", () => {
    it("should handle actual Akita Chuo Kotsu trip IDs from documentation", () => {
      // Based on copilot instructions examples
      const context: RouteExtractionContext = {
        trip_id: "平日_05時11分_系統6001",
        route_short_name: "都心循環線",
      };

      const result = extractAkitaChuoKotsu(context);

      expect(result.routeNumber).toBe("600");
    });
  });
});
