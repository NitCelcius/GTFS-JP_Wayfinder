import { renderHook } from "@testing-library/react";

import { DefaultTimeFormatter, TimeFormatterBase } from "../TimeFormatterBase";
import { useTimeDisplay } from "../useTimeDisplay";

describe("useTimeDisplay", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("DefaultTimeFormatter, Japanese locale", () => {
    const formatter = new DefaultTimeFormatter("ja");

    it("should return まもなく for times less than 1 minute", () => {
      expect(formatter.format(30)).toBe("まもなく");
      expect(formatter.format(59)).toBe("まもなく");
      expect(formatter.format(0)).toBe("まもなく");
      expect(formatter.format(-30)).toBe("まもなく");
      expect(formatter.format(-59)).toBe("まもなく");
    });

    it("should format minutes correctly", () => {
      expect(formatter.format(60)).toBe("1分後");
      expect(formatter.format(120)).toBe("2分後");
      expect(formatter.format(3599)).toBe("59分後");
      expect(formatter.format(-60)).toBe("1分前");
      expect(formatter.format(-120)).toBe("2分前");
    });

    it("should format hours correctly", () => {
      expect(formatter.format(3600)).toBe("1時間後");
      expect(formatter.format(7200)).toBe("2時間後");
      expect(formatter.format(-3600)).toBe("1時間前");
      expect(formatter.format(-7200)).toBe("2時間前");
    });

    it("should calculate next update time correctly", () => {
      // Less than 1 minute: update when crossing 1-minute threshold
      expect(formatter.getNextUpdateMs(30)).toBe(30000); // 30 seconds until 60

      // 1-59 minutes: update at next minute boundary
      expect(formatter.getNextUpdateMs(90)).toBe(30000); // 1:30, update in 30s at 2:00

      // 60+ minutes: update at next hour boundary
      expect(formatter.getNextUpdateMs(3900)).toBe(300000); // 1:05:00, update in 5min at 2:00:00
    });
  });

  describe("DefaultTimeFormatter, English locale", () => {
    const formatter = new DefaultTimeFormatter("en");

    it("should return 'now' for times less than 1 minute", () => {
      expect(formatter.format(30)).toBe("now");
      expect(formatter.format(59)).toBe("now");
      expect(formatter.format(0)).toBe("now");
      expect(formatter.format(-30)).toBe("now");
      expect(formatter.format(-59)).toBe("now");
    });

    it("should format minutes correctly in English", () => {
      expect(formatter.format(60)).toBe("in 1 minute");
      expect(formatter.format(120)).toBe("in 2 minutes");
      expect(formatter.format(300)).toBe("in 5 minutes");
      expect(formatter.format(3599)).toBe("in 59 minutes");
      expect(formatter.format(-60)).toBe("1 minute ago");
      expect(formatter.format(-120)).toBe("2 minutes ago");
    });

    it("should format hours correctly in English", () => {
      expect(formatter.format(3600)).toBe("in 1 hour");
      expect(formatter.format(7200)).toBe("in 2 hours");
      expect(formatter.format(-3600)).toBe("1 hour ago");
      expect(formatter.format(-7200)).toBe("2 hours ago");
    });

    it("should work with en-US locale variant", () => {
      const formatterUS = new DefaultTimeFormatter("en-US");
      expect(formatterUS.format(30)).toBe("now");
      expect(formatterUS.format(300)).toBe("in 5 minutes");
    });

    it("should work with en-GB locale variant", () => {
      const formatterGB = new DefaultTimeFormatter("en-GB");
      expect(formatterGB.format(30)).toBe("now");
      expect(formatterGB.format(300)).toBe("in 5 minutes");
    });
  });

  describe("useTimeDisplay hook", () => {
    it("should return the fallback string when relative time is disabled", () => {
      process.env.NEXT_PUBLIC_USE_RELATIVE_TIME = "false";

      const { result } = renderHook(() => useTimeDisplay());
      const datetime = new Date("2025-10-29T10:30:00");
      const fallbackString = "10:30";

      expect(result.current.format(datetime, fallbackString)).toBe(
        fallbackString
      );
    });

    it("should return the fallback string when env var is not set", () => {
      delete process.env.NEXT_PUBLIC_USE_RELATIVE_TIME;

      const { result } = renderHook(() => useTimeDisplay());
      const datetime = new Date("2025-10-29T10:30:00");
      const fallbackString = "10:30";

      expect(result.current.format(datetime, fallbackString)).toBe(
        fallbackString
      );
    });

    it("should return relative time when enabled", () => {
      process.env.NEXT_PUBLIC_USE_RELATIVE_TIME = "true";

      // Use Japanese formatter explicitly to ensure consistent test results
      const japaneseFormatter = new DefaultTimeFormatter("ja");
      const { result } = renderHook(() => useTimeDisplay(japaneseFormatter));

      // Create a datetime 5 minutes in the future
      const now = result.current.now;
      const futureTime = new Date(now.getTime() + 5 * 60 * 1000);

      const formatted = result.current.format(futureTime, "10:30");
      expect(formatted).toBe("5分後");
    });

    it("should use custom formatter when provided", () => {
      process.env.NEXT_PUBLIC_USE_RELATIVE_TIME = "true";

      class CustomFormatter extends TimeFormatterBase {
        format(secondsUntilTarget: number): string {
          const minutes = Math.floor(Math.abs(secondsUntilTarget) / 60);
          const isPast = secondsUntilTarget < 0;
          return isPast ? `${minutes}m ago` : `in ${minutes}m`;
        }
      }

      const { result } = renderHook(() =>
        useTimeDisplay(new CustomFormatter())
      );

      const now = result.current.now;
      const futureTime = new Date(now.getTime() + 5 * 60 * 1000);

      const formatted = result.current.format(futureTime, "10:30");
      expect(formatted).toBe("in 5m");
    });

    it("should return fallback string when datetime is invalid", () => {
      process.env.NEXT_PUBLIC_USE_RELATIVE_TIME = "true";

      const { result } = renderHook(() => useTimeDisplay());

      const invalidDate = new Date("invalid-date");
      const fallbackString = "10:30";

      expect(result.current.format(invalidDate, fallbackString)).toBe(
        fallbackString
      );
    });

    it("should handle exceptions gracefully", () => {
      process.env.NEXT_PUBLIC_USE_RELATIVE_TIME = "true";

      class ThrowingFormatter extends TimeFormatterBase {
        format(): string {
          throw new Error("Format error");
        }
      }

      const { result } = renderHook(() =>
        useTimeDisplay(new ThrowingFormatter())
      );
      const datetime = new Date("2025-10-29T10:30:00");
      const fallbackString = "10:30";

      expect(result.current.format(datetime, fallbackString)).toBe(
        fallbackString
      );
    });
  });
});
