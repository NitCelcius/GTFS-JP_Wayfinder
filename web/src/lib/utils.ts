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

/**
 * Format a timestamp to a relative date string (e.g., "今日 14:30", "昨日 12:15", "2日前 10:00")
 */
export function formatRelativeDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();

  // Calculate the difference in days
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Format time as HH:MM
  const timeStr = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

  if (diffDays === 0) {
    return `今日 ${timeStr}`;
  } else if (diffDays === 1) {
    return `昨日 ${timeStr}`;
  } else if (diffDays < 7) {
    return `${diffDays}日前 ${timeStr}`;
  } else {
    // For older dates, show the actual date
    return `${date.getMonth() + 1}/${date.getDate()} ${timeStr}`;
  }
}
