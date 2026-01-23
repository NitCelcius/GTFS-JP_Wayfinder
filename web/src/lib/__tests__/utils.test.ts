import {
  calculateCurrentBusLocation,
  calculateDurationJapanese,
  calculateDurationMinutes,
  formatRelativeDate,
  parseGtfsTime,
  parseGtfsTimeNoWrap,
  parseTimeToMinutes,
  sortTravelsByArrivalTime,
  trimTimeSeconds,
} from "../utils";

describe("formatRelativeDate", () => {
  beforeEach(() => {
    // Mock Date.now() to return a fixed timestamp
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-10-31T10:00:00+09:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should format time for today", () => {
    const timestamp = new Date("2025-10-31T08:45:00+09:00").getTime();
    const result = formatRelativeDate(timestamp);
    expect(result).toBe("今日 08:45");
  });

  it("should format time for yesterday", () => {
    const timestamp = new Date("2025-10-30T14:30:00+09:00").getTime();
    const result = formatRelativeDate(timestamp);
    expect(result).toBe("昨日 14:30");
  });

  it("should format time for 2 days ago", () => {
    const timestamp = new Date("2025-10-29T12:15:00+09:00").getTime();
    const result = formatRelativeDate(timestamp);
    expect(result).toBe("2日前 12:15");
  });

  it("should format time for 6 days ago", () => {
    const timestamp = new Date("2025-10-25T09:00:00+09:00").getTime();
    const result = formatRelativeDate(timestamp);
    expect(result).toBe("6日前 09:00");
  });

  it("should format date for older than 7 days", () => {
    const timestamp = new Date("2025-10-20T10:30:00+09:00").getTime();
    const result = formatRelativeDate(timestamp);
    expect(result).toBe("10/20 10:30");
  });

  it("should handle midnight correctly", () => {
    const timestamp = new Date("2025-10-31T00:00:00+09:00").getTime();
    const result = formatRelativeDate(timestamp);
    expect(result).toBe("今日 00:00");
  });

  it("should keep timezone offsets from ISO strings", () => {
    const isoWithOffset = "2025-10-31T08:45:00+09:00";
    const result = formatRelativeDate(isoWithOffset);
    expect(result).toBe("今日 08:45");
  });
});

describe("parseTimeToMinutes", () => {
  it("should parse HH:MM format correctly", () => {
    expect(parseTimeToMinutes("08:30")).toBe(510); // 8*60 + 30
    expect(parseTimeToMinutes("14:45")).toBe(885); // 14*60 + 45
    expect(parseTimeToMinutes("00:00")).toBe(0);
    expect(parseTimeToMinutes("23:59")).toBe(1439); // 23*60 + 59
  });

  it("should parse HH:MM:SS format correctly (ignoring seconds)", () => {
    expect(parseTimeToMinutes("08:30:45")).toBe(510); // seconds ignored
    expect(parseTimeToMinutes("14:45:00")).toBe(885);
  });

  it("should handle next-day times (hours > 24)", () => {
    expect(parseTimeToMinutes("25:30")).toBe(1530); // 25*60 + 30
    expect(parseTimeToMinutes("47:59")).toBe(2879); // 47*60 + 59
  });

  it("should throw error for invalid format", () => {
    expect(() => parseTimeToMinutes("")).toThrow("Invalid time string");
    expect(() => parseTimeToMinutes("25")).toThrow("Invalid time format");
    expect(() => parseTimeToMinutes("abc:def")).toThrow("Invalid time format");
  });

  it("should throw error for out of range values", () => {
    expect(() => parseTimeToMinutes("48:00")).toThrow(
      "Invalid hours. Must be between 0-47"
    );
    expect(() => parseTimeToMinutes("08:60")).toThrow(
      "Invalid minutes. Must be between 0-59"
    );
    // Note: Negative values are caught by regex first, not by range validation
    expect(() => parseTimeToMinutes("-1:30")).toThrow("Invalid time format");
  });
});

describe("calculateDurationMinutes", () => {
  it("should calculate duration correctly for same-day trips", () => {
    expect(calculateDurationMinutes("08:00", "08:45")).toBe(45);
    expect(calculateDurationMinutes("10:30", "12:15")).toBe(105); // 1h 45min
    expect(calculateDurationMinutes("00:00", "23:59")).toBe(1439);
  });

  it("should handle overnight trips with normalized times (0-23 hours)", () => {
    // When both times use normalized hours (0-23), overnight detection works via negative diff
    expect(calculateDurationMinutes("23:30", "01:00")).toBe(90); // 1h 30min
    expect(calculateDurationMinutes("22:00", "02:30")).toBe(270); // 4h 30min
  });

  it("should handle GTFS extended hours (24-47) for next-day arrivals", () => {
    // When arrival uses GTFS extended hours, the difference is already positive
    expect(calculateDurationMinutes("23:00", "25:30")).toBe(150); // 2h 30min (25:30 = 1:30 AM next day)
    expect(calculateDurationMinutes("22:00", "26:00")).toBe(240); // 4h (26:00 = 2:00 AM next day)
    expect(calculateDurationMinutes("20:00", "24:30")).toBe(270); // 4h 30min (24:30 = 0:30 AM next day)
  });

  it("should handle zero duration", () => {
    expect(calculateDurationMinutes("08:00", "08:00")).toBe(0);
  });
});

describe("calculateDurationJapanese", () => {
  it("should format duration under 1 hour in minutes only", () => {
    expect(calculateDurationJapanese("08:00", "08:45")).toBe("45分");
    expect(calculateDurationJapanese("10:00", "10:15")).toBe("15分");
  });

  it("should format duration of exactly 1+ hours without 0分", () => {
    expect(calculateDurationJapanese("08:00", "09:00")).toBe("1時間");
    expect(calculateDurationJapanese("08:00", "10:00")).toBe("2時間");
  });

  it("should format duration with hours and minutes", () => {
    expect(calculateDurationJapanese("08:00", "09:30")).toBe("1時間30分");
    expect(calculateDurationJapanese("10:15", "12:45")).toBe("2時間30分");
  });

  it("should handle overnight trips with normalized times (0-23 hours)", () => {
    expect(calculateDurationJapanese("23:30", "01:00")).toBe("1時間30分");
    expect(calculateDurationJapanese("23:00", "01:00")).toBe("2時間");
  });

  it("should handle GTFS extended hours (24-47) for next-day arrivals", () => {
    expect(calculateDurationJapanese("23:00", "25:30")).toBe("2時間30分"); // 25:30 = 1:30 AM next day
    expect(calculateDurationJapanese("22:00", "26:00")).toBe("4時間"); // 26:00 = 2:00 AM next day
    expect(calculateDurationJapanese("20:00", "24:30")).toBe("4時間30分"); // 24:30 = 0:30 AM next day
  });
});

describe("sortTravelsByArrivalTime", () => {
  it("should sort travels by arrival time (earliest first)", () => {
    const travels = [
      { arrival_time: "10:00", id: "1" },
      { arrival_time: "08:30", id: "2" },
      { arrival_time: "09:15", id: "3" },
    ];

    const sorted = sortTravelsByArrivalTime(travels);

    expect(sorted[0].id).toBe("2"); // 08:30
    expect(sorted[1].id).toBe("3"); // 09:15
    expect(sorted[2].id).toBe("1"); // 10:00
  });

  it("should handle GTFS extended hours for next-day arrivals", () => {
    const travels = [
      { arrival_time: "25:30", id: "nextday" }, // 1:30 AM next day (GTFS format)
      { arrival_time: "23:30", id: "late" }, // 11:30 PM same day
      { arrival_time: "10:00", id: "morning" }, // 10:00 AM same day
    ];

    const sorted = sortTravelsByArrivalTime(travels);

    // Expected order: morning (10:00), late (23:30), nextday (25:30 = 1:30 AM next day)
    expect(sorted[0].id).toBe("morning"); // 600 min
    expect(sorted[1].id).toBe("late"); // 1410 min
    expect(sorted[2].id).toBe("nextday"); // 1530 min
  });

  it("should correctly sort mixed GTFS extended hours and regular times", () => {
    // Test case from PR review: mixing times like ["25:30", "01:00", "10:00"]
    const travels = [
      { arrival_time: "25:30", id: "gtfs-nextday" }, // 1530 min (1:30 AM next day in GTFS format)
      { arrival_time: "01:00", id: "early-morning" }, // 60 min (1:00 AM same day)
      { arrival_time: "10:00", id: "morning" }, // 600 min
    ];

    const sorted = sortTravelsByArrivalTime(travels);

    // Pure numeric sort: 01:00 (60) < 10:00 (600) < 25:30 (1530)
    expect(sorted[0].id).toBe("early-morning"); // 60 min
    expect(sorted[1].id).toBe("morning"); // 600 min
    expect(sorted[2].id).toBe("gtfs-nextday"); // 1530 min
  });

  it("should not mutate original array", () => {
    const travels = [
      { arrival_time: "10:00", id: "1" },
      { arrival_time: "08:30", id: "2" },
    ];

    const original = [...travels];
    sortTravelsByArrivalTime(travels);

    expect(travels).toEqual(original);
  });

  it("should handle empty array", () => {
    const sorted = sortTravelsByArrivalTime([]);
    expect(sorted).toEqual([]);
  });

  it("should handle single item", () => {
    const travels = [{ arrival_time: "10:00", id: "1" }];
    const sorted = sortTravelsByArrivalTime(travels);
    expect(sorted).toEqual(travels);
  });
});

describe("trimTimeSeconds", () => {
  it("should trim seconds from HH:MM:SS format", () => {
    expect(trimTimeSeconds("14:30:00")).toBe("14:30");
    expect(trimTimeSeconds("08:15:00")).toBe("08:15");
    expect(trimTimeSeconds("23:59:59")).toBe("23:59");
  });

  it("should handle HH:MM format (already trimmed)", () => {
    expect(trimTimeSeconds("14:30")).toBe("14:30");
    expect(trimTimeSeconds("08:15")).toBe("08:15");
  });

  it("should handle extended hours (GTFS format)", () => {
    expect(trimTimeSeconds("25:30:00")).toBe("25:30");
    expect(trimTimeSeconds("26:45:00")).toBe("26:45");
  });

  it("should return original string if format is unexpected", () => {
    expect(trimTimeSeconds("invalid")).toBe("invalid");
    expect(trimTimeSeconds("")).toBe("");
  });
});

describe("parseGtfsTime", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should parse basic time format", () => {
    const baseDate = new Date(2025, 9, 31, 10, 0, 0); // Local timezone: Oct 31, 2025, 10:00
    jest.setSystemTime(baseDate);

    const result = parseGtfsTime("14:30:00", baseDate);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
    expect(result.getDate()).toBe(31);
  });

  it("should handle extended hours (24+)", () => {
    const baseDate = new Date(2025, 9, 31, 10, 0, 0); // Local timezone: Oct 31, 2025, 10:00
    jest.setSystemTime(baseDate);

    const result = parseGtfsTime("25:30:00", baseDate);
    expect(result.getHours()).toBe(1);
    expect(result.getMinutes()).toBe(30);
    expect(result.getDate()).toBe(1); // Next day (November 1st)
  });

  it("should wrap past times to tomorrow", () => {
    // Current time is 15:00, bus time is 14:00 (1 hour ago)
    const baseDate = new Date(2025, 9, 31, 15, 0, 0); // Local timezone: Oct 31, 2025, 15:00
    jest.setSystemTime(baseDate);

    const result = parseGtfsTime("14:00:00", baseDate);
    // Should be tomorrow at 14:00
    expect(result.getDate()).toBe(1); // November 1st
    expect(result.getHours()).toBe(14);
  });

  it("should not wrap future times", () => {
    // Current time is 10:00, bus time is 14:00 (4 hours from now)
    const baseDate = new Date(2025, 9, 31, 10, 0, 0); // Local timezone: Oct 31, 2025, 10:00
    jest.setSystemTime(baseDate);

    const result = parseGtfsTime("14:00:00", baseDate);
    // Should be today at 14:00
    expect(result.getDate()).toBe(31);
    expect(result.getHours()).toBe(14);
  });

  it("should throw error for invalid format", () => {
    const baseDate = new Date(2025, 9, 31, 10, 0, 0);
    expect(() => parseGtfsTime("invalid", baseDate)).toThrow(
      "Invalid time format"
    );
    expect(() => parseGtfsTime("25", baseDate)).toThrow("Invalid time format");
  });
});

describe("parseGtfsTimeNoWrap", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should parse basic time format", () => {
    const baseDate = new Date(2025, 9, 31, 10, 0, 0); // Local timezone: Oct 31, 2025, 10:00
    jest.setSystemTime(baseDate);

    const result = parseGtfsTimeNoWrap("14:30:00", baseDate);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
    expect(result.getDate()).toBe(31);
  });

  it("should handle extended hours (24+)", () => {
    const baseDate = new Date(2025, 9, 31, 10, 0, 0); // Local timezone: Oct 31, 2025, 10:00
    jest.setSystemTime(baseDate);

    const result = parseGtfsTimeNoWrap("25:30:00", baseDate);
    expect(result.getHours()).toBe(1);
    expect(result.getMinutes()).toBe(30);
    expect(result.getDate()).toBe(1); // Next day (November 1st)
  });

  it("should NOT wrap past times to tomorrow", () => {
    // Current time is 15:00, bus time is 14:00 (1 hour ago)
    const baseDate = new Date(2025, 9, 31, 15, 0, 0); // Local timezone: Oct 31, 2025, 15:00
    jest.setSystemTime(baseDate);

    const result = parseGtfsTimeNoWrap("14:00:00", baseDate);
    // Should be today at 14:00 (in the past)
    expect(result.getDate()).toBe(31);
    expect(result.getHours()).toBe(14);
    expect(result < baseDate).toBe(true); // Should be in the past
  });

  it("should allow calculating negative time differences", () => {
    // Current time is 15:00, bus time is 14:00
    const baseDate = new Date(2025, 9, 31, 15, 0, 0); // Local timezone: Oct 31, 2025, 15:00
    jest.setSystemTime(baseDate);

    const arrivalTime = parseGtfsTimeNoWrap("14:00:00", baseDate);
    const diffMs = arrivalTime.getTime() - baseDate.getTime();
    const diffMinutes = Math.round(diffMs / 60000);

    expect(diffMinutes).toBe(-60); // 1 hour ago
  });
});

describe("calculateCurrentBusLocation", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockStops = [
    { stop_id: "1", stop_name: "Stop 1", arrival_time: "13:59:00" },
    { stop_id: "2", stop_name: "Stop 2", arrival_time: "14:00:00" },
    { stop_id: "3", stop_name: "Stop 3", arrival_time: "14:05:00" },
    { stop_id: "4", stop_name: "Stop 4", arrival_time: "14:10:00" },
    { stop_id: "5", stop_name: "Stop 5", arrival_time: "14:15:00" },
  ];

  it("should return -1 when bus has not departed yet", () => {
    // Current time is 13:50, first stop is at 13:59
    const now = new Date(2025, 9, 31, 13, 50, 0); // Local timezone: Oct 31, 2025, 13:50
    jest.setSystemTime(now);

    const result = calculateCurrentBusLocation(mockStops, now);
    expect(result).toBe(-1);
  });

  it("should return 0 when bus is at or just passed first stop", () => {
    // Current time is 13:59:30 (just after first stop at 13:59)
    const now = new Date(2025, 9, 31, 13, 59, 30); // Local timezone: Oct 31, 2025, 13:59:30
    jest.setSystemTime(now);

    const result = calculateCurrentBusLocation(mockStops, now);
    expect(result).toBe(0);
  });

  it("should return correct index when bus is en route", () => {
    // Current time is 14:07 (between stop 3 at 14:05 and stop 4 at 14:10)
    const now = new Date(2025, 9, 31, 14, 7, 0); // Local timezone: Oct 31, 2025, 14:07
    jest.setSystemTime(now);

    const result = calculateCurrentBusLocation(mockStops, now);
    expect(result).toBe(2); // Index of stop 3 (14:05)
  });

  it("should return last index when bus has completed the trip", () => {
    // Current time is 14:20 (after all stops)
    const now = new Date(2025, 9, 31, 14, 20, 0); // Local timezone: Oct 31, 2025, 14:20
    jest.setSystemTime(now);

    const result = calculateCurrentBusLocation(mockStops, now);
    expect(result).toBe(4); // Index of last stop
  });

  it("should correctly calculate remaining stops", () => {
    // Current time is 14:07 (bus at stop 3, user waiting at stop 5)
    const now = new Date(2025, 9, 31, 14, 7, 0); // Local timezone: Oct 31, 2025, 14:07
    jest.setSystemTime(now);

    const busLocationIndex = calculateCurrentBusLocation(mockStops, now);
    const userStopIndex = 4; // Stop 5

    const stopsUntilArrival = userStopIndex - busLocationIndex;
    expect(stopsUntilArrival).toBe(2); // 2 stops away
  });

  it("should handle empty stops array", () => {
    const now = new Date(2025, 9, 31, 14, 0, 0); // Local timezone: Oct 31, 2025, 14:00
    jest.setSystemTime(now);

    const result = calculateCurrentBusLocation([], now);
    expect(result).toBe(-1);
  });
});
