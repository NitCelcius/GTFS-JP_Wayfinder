import { formatRelativeDate } from "../utils";

describe("formatRelativeDate", () => {
  beforeEach(() => {
    // Mock Date.now() to return a fixed timestamp
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-10-31T10:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should format time for today", () => {
    const timestamp = new Date("2025-10-31T08:45:00Z").getTime();
    const result = formatRelativeDate(timestamp);
    expect(result).toBe("今日 08:45");
  });

  it("should format time for yesterday", () => {
    const timestamp = new Date("2025-10-30T14:30:00Z").getTime();
    const result = formatRelativeDate(timestamp);
    expect(result).toBe("昨日 14:30");
  });

  it("should format time for 2 days ago", () => {
    const timestamp = new Date("2025-10-29T12:15:00Z").getTime();
    const result = formatRelativeDate(timestamp);
    expect(result).toBe("2日前 12:15");
  });

  it("should format time for 6 days ago", () => {
    const timestamp = new Date("2025-10-25T09:00:00Z").getTime();
    const result = formatRelativeDate(timestamp);
    expect(result).toBe("6日前 09:00");
  });

  it("should format date for older than 7 days", () => {
    const timestamp = new Date("2025-10-20T10:30:00Z").getTime();
    const result = formatRelativeDate(timestamp);
    expect(result).toBe("10/20 10:30");
  });

  it("should handle midnight correctly", () => {
    const timestamp = new Date("2025-10-31T00:00:00Z").getTime();
    const result = formatRelativeDate(timestamp);
    expect(result).toBe("今日 00:00");
  });

  it("should keep timezone offsets from ISO strings", () => {
    const isoWithOffset = "2025-10-31T08:45:00+09:00";
    const result = formatRelativeDate(isoWithOffset);
    expect(result).toBe("今日 08:45");
  });
});
