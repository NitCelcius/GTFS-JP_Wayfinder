// Utility functions

export const formatTime = (timeStr: string): string => {
  try {
    return new Date(timeStr).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return timeStr;
  }
};

export const formatDepartureTime = (timeStr: string): string => {
  try {
    const date = new Date(timeStr);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return timeStr;
    }

    const today = new Date();

    // Check if the date is the same as today
    const isSameDay =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    if (isSameDay) {
      // Format as HH:mm (fixed format, no locale dependency)
      const hours = date.getHours().toString();
      const minutes = date.getMinutes().toString();
      return `${hours}:${minutes}`;
    } else {
      // Format as locale-based format (absolute, except for the year)
      return (
        date.toLocaleDateString(undefined, {
          month: "2-digit",
          day: "2-digit",
        }) +
        " " +
        date.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  } catch {
    return timeStr;
  }
};

export const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString("ja-JP");
  } catch {
    return dateStr;
  }
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};

/**
 * Get the current time as a string in HH:MM:SS format
 * @returns Current time formatted as "HH:MM:SS"
 */
export const getCurrentTimeString = (): string => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:00`;
};

// Helper function to calculate duration between two time strings, accepts both HH:MM and HH:MM:SS formats
export function calculateDurationStr(
  departureTime: string,
  arrivalTime: string
): string {
  // Validate input format - now accepts both HH:MM and HH:MM:SS
  const timeFormatRegex = /^\d{1,2}:\d{2}(:\d{2})?$/;
  const MAX_HOUR = 47; // may exceed 24 for next day arrivals

  if (!timeFormatRegex.test(departureTime)) {
    throw new Error(
      `Invalid departure time format. Please use HH:MM or HH:MM:SS format. Input: "${departureTime}"`
    );
  }

  if (!timeFormatRegex.test(arrivalTime)) {
    throw new Error(
      `Invalid arrival time format. Please use HH:MM or HH:MM:SS format. Input: "${arrivalTime}"`
    );
  }

  // Parse time components - handle both HH:MM and HH:MM:SS formats
  const parseTimeString = (timeStr: string) => {
    const parts = timeStr.split(":").map(Number);
    const hour = parts[0];
    const minute = parts[1];
    const second = parts[2] || 0; // Default to 0 if seconds not provided
    return { hour, minute, second };
  };

  const depTime = parseTimeString(departureTime);
  const arrTime = parseTimeString(arrivalTime);

  // Validate time ranges
  if (depTime.hour < 0 || depTime.hour > MAX_HOUR || isNaN(depTime.hour)) {
    throw new Error(
      `Invalid departure hour. Must be between 0-${MAX_HOUR}. Input: "${depTime.hour}"`
    );
  }

  if (depTime.minute < 0 || depTime.minute > 59 || isNaN(depTime.minute)) {
    throw new Error(
      `Invalid departure minutes. Must be between 0-59. Input: "${depTime.minute}"`
    );
  }

  if (arrTime.hour < 0 || arrTime.hour > MAX_HOUR || isNaN(arrTime.hour)) {
    throw new Error(
      `Invalid arrival hour. Must be between 0-${MAX_HOUR}. Input: "${arrTime.hour}"`
    );
  }

  if (arrTime.minute < 0 || arrTime.minute > 59 || isNaN(arrTime.minute)) {
    throw new Error(
      `Invalid arrival minutes. Must be between 0-59. Input: "${arrTime.minute}"`
    );
  }

  // Convert to total minutes (seconds are ignored for duration calculation)
  const depTotalMin = depTime.hour * 60 + depTime.minute;
  const arrTotalMin = arrTime.hour * 60 + arrTime.minute;

  let diffMin = arrTotalMin - depTotalMin;

  // Handle next day arrival
  if (diffMin < 0) {
    diffMin += 24 * 60;
  }

  return `${diffMin}分`;
}

/**
 * Create a Date object from a time string (HH:MM or HH:MM:SS)
 * Uses 2021-01-01 as the base date for consistency with API datetime format
 */
export function createDatetime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":");
  const date = new Date("2021-01-01");
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  return date;
}

type RelativeDateInput = number | string | Date;

interface RelativeDateOptions {
  /**
   * Preferred timezone for formatting (IANA). If the input ISO string contains an
   * explicit numeric offset (+HH:MM or Z) and no timeZone is provided, that offset
   * will be honored to keep the original timezone information.
   */
  timeZone?: string;
}

interface DateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

const DEFAULT_TIMEZONE = "Asia/Tokyo";
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

/**
 * Extract offset minutes from an ISO string using string operations (no regex).
 * Returns null if no offset is present (naive datetime).
 * Handles both colon-separated (±HH:MM) and compact (±HHMM) offset formats.
 */
function extractOffsetFromIso(isoString: string): number | null {
  // Handle Z suffix (UTC)
  if (isoString.endsWith("Z")) {
    return 0;
  }

  // Find the last + or - that indicates an offset (must appear after 'T')
  const lastPlus = isoString.lastIndexOf("+");
  const lastMinus = isoString.lastIndexOf("-");

  // Offset separator must be after position 10 (minimum: YYYY-MM-DD)
  const offsetIndex = Math.max(
    lastPlus > 10 ? lastPlus : -1,
    lastMinus > 10 ? lastMinus : -1
  );

  if (offsetIndex === -1) {
    return null;
  }

  const offsetPart = isoString.slice(offsetIndex);
  const sign = offsetPart[0];
  const offsetStr = offsetPart.slice(1);

  let hours: number;
  let minutes: number;

  if (offsetStr.includes(":")) {
    // Colon-separated format: HH:MM or HH:MM:SS
    const parts = offsetStr.split(":");
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10);
  } else if (offsetStr.length >= 2) {
    // Compact format: HHMM or HH
    hours = parseInt(offsetStr.slice(0, 2), 10);
    minutes = offsetStr.length >= 4 ? parseInt(offsetStr.slice(2, 4), 10) : 0;
  } else {
    return null;
  }

  const totalMinutes = hours * 60 + minutes;
  return sign === "-" ? -totalMinutes : totalMinutes;
}

function getPartsWithOffset(date: Date, offsetMinutes: number): DateParts {
  const shifted = new Date(date.getTime() + offsetMinutes * 60 * 1000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours() % 24, // Normalize hour to 0-23 range
    minute: shifted.getUTCMinutes(),
  };
}

function getPartsWithTimeZone(date: Date, timeZone: string): DateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});

  return {
    year: parseInt(parts.year, 10),
    month: parseInt(parts.month, 10),
    day: parseInt(parts.day, 10),
    hour: parseInt(parts.hour, 10) % 24, // Normalize hour to 0-23 range (handles 24:00 case)
    minute: parseInt(parts.minute, 10),
  };
}

function computeRelativeLabel(
  dateParts: DateParts,
  nowParts: DateParts
): string {
  const dateDay = Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day);
  const nowDay = Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day);

  const diffDays = Math.floor((nowDay - dateDay) / MS_PER_DAY);
  const timeStr = `${pad2(dateParts.hour)}:${pad2(dateParts.minute)}`;

  if (diffDays === 0) {
    return `今日 ${timeStr}`;
  }
  if (diffDays === 1) {
    return `昨日 ${timeStr}`;
  }
  if (diffDays < 7) {
    return `${diffDays}日前 ${timeStr}`;
  }
  return `${dateParts.month}/${dateParts.day} ${timeStr}`;
}

/**
 * Format a timestamp/ISO string to a relative date string (e.g., "今日 14:30", "昨日 12:15").
 * Keeps timezone information if the ISO string includes an explicit offset.
 */
export function formatRelativeDate(
  input: RelativeDateInput,
  options: RelativeDateOptions = {}
): string {
  const date = input instanceof Date ? input : new Date(input);

  // Determine timezone: if ISO string with offset and no explicit timeZone option, preserve offset
  const timeZone = options.timeZone ?? DEFAULT_TIMEZONE;
  let offsetMinutes: number | null = null;

  if (typeof input === "string" && options.timeZone === undefined) {
    offsetMinutes = extractOffsetFromIso(input);
  }

  // If offset was found and no explicit timeZone, use offset for formatting
  const dateParts =
    offsetMinutes !== null
      ? getPartsWithOffset(date, offsetMinutes)
      : getPartsWithTimeZone(date, timeZone);

  // Use same timezone logic for "now"
  const now = new Date();
  const nowParts =
    offsetMinutes !== null
      ? getPartsWithOffset(now, offsetMinutes)
      : getPartsWithTimeZone(now, timeZone);

  return computeRelativeLabel(dateParts, nowParts);
}
