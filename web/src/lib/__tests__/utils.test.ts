import {
  calculateDurationJapanese,
  calculateDurationMinutes,
  formatRelativeDate,
  parseTimeToMinutes,
  sortTravelsByArrivalTime,
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
