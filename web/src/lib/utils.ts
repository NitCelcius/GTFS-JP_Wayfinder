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

// Helper function to calculate duration between two time strings, HH:MM format only
export function calculateDurationStr(
  departureTime: string,
  arrivalTime: string
): string {
  // Validate input format
  const timeFormatRegex = /^\d{1,2}:\d{2}$/;
  const MAX_HOUR = 47; // may exceed 24 for next day arrivals

  if (!timeFormatRegex.test(departureTime)) {
    throw new Error(
      `Invalid departure time format. Please use HH:MM format. Input: "${departureTime}"`
    );
  }

  if (!timeFormatRegex.test(arrivalTime)) {
    throw new Error(
      `Invalid arrival time format. Please use HH:MM format. Input: "${arrivalTime}"`
    );
  }

  const [depHour, depMin] = departureTime.split(":").map(Number);
  const [arrHour, arrMin] = arrivalTime.split(":").map(Number);

  // Validate time ranges
  if (depHour < 0 || depHour > MAX_HOUR || isNaN(depHour)) {
    throw new Error(
      `Invalid departure hour. Must be between 0-${MAX_HOUR}. Input: "${depHour}"`
    );
  }

  if (depMin < 0 || depMin > 59 || isNaN(depMin)) {
    throw new Error(
      `Invalid departure minutes. Must be between 0-59. Input: "${depMin}"`
    );
  }

  if (arrHour < 0 || arrHour > MAX_HOUR || isNaN(arrHour)) {
    throw new Error(
      `Invalid arrival hour. Must be between 0-${MAX_HOUR}. Input: "${arrHour}"`
    );
  }

  if (arrMin < 0 || arrMin > 59 || isNaN(arrMin)) {
    throw new Error(
      `Invalid arrival minutes. Must be between 0-59. Input: "${arrMin}"`
    );
  }

  const depTotalMin = depHour * 60 + depMin;
  const arrTotalMin = arrHour * 60 + arrMin;

  let diffMin = arrTotalMin - depTotalMin;

  // Handle next day arrival
  if (diffMin < 0) {
    diffMin += 24 * 60;
  }

  return `${diffMin}分`;
}
