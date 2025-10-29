import { useEffect, useMemo, useRef, useState } from "react";

import { DefaultTimeFormatter, TimeFormatterBase } from "./TimeFormatterBase";

// Default singleton instance
const defaultFormatterInstance = new DefaultTimeFormatter();

export function useTimeDisplay(
  formatter: TimeFormatterBase = defaultFormatterInstance
) {
  const useRelativeTime = process.env.NEXT_PUBLIC_USE_RELATIVE_TIME === "true";
  const [now, setNow] = useState<Date>(new Date());
  const trackedTimesRef = useRef<Set<number>>(new Set());

  const stableFormatter = useMemo(() => formatter, [formatter]);

  useEffect(() => {
    if (!useRelativeTime) return;

    let timeoutId: NodeJS.Timeout | null = null;

    const scheduleNextUpdate = (updateNow: boolean = false) => {
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      const currentTime = new Date();

      // Only update state when timeout fires, not on initial setup
      if (updateNow) {
        setNow(currentTime);
      }

      // Calculate the minimum interval from all tracked times
      let minInterval = 60000; // Default to 60 seconds if no times tracked

      if (trackedTimesRef.current.size > 0) {
        const currentMs = currentTime.getTime();
        const intervals = Array.from(trackedTimesRef.current).map(
          (targetMs) => {
            const secondsUntilTarget = Math.floor(
              (targetMs - currentMs) / 1000
            );
            return stableFormatter.getNextUpdateMs(secondsUntilTarget);
          }
        );
        minInterval = Math.min(...intervals);
      }

      // Schedule next update - this will trigger state update
      timeoutId = setTimeout(() => scheduleNextUpdate(true), minInterval);
    }; // Start the update cycle (don't update now on initial mount)
    scheduleNextUpdate(false);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [useRelativeTime, stableFormatter]);

  const format = (datetime: Date, fallbackString: string): string => {
    if (!useRelativeTime) return fallbackString;

    try {
      // Validate that the date is valid
      if (isNaN(datetime.getTime())) {
        console.warn(
          "[useTimeDisplay] Invalid Date provided, using fallback:",
          fallbackString
        );
        return fallbackString;
      }

      const targetMs = datetime.getTime();
      if (!trackedTimesRef.current.has(targetMs)) {
        trackedTimesRef.current.add(targetMs);
      }

      // Calculate seconds until target time (positive = future, negative = past)
      const secondsUntilTarget = Math.floor((targetMs - now.getTime()) / 1000);

      return stableFormatter.format(secondsUntilTarget);
    } catch (error) {
      console.warn("[useTimeDisplay] Error formatting datetime:", error);
      return fallbackString;
    }
  };

  return { format, now };
}
