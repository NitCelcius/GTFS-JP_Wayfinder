"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter, useSearchParams } from "next/navigation";

import type { TripTimedStop } from "@/api/types.gen";
import { ErrorFullScreen } from "@/components/common";
import { BusTripDetail } from "@/domains/bus-stop";
import type { Stop } from "@/domains/bus-stop/BusTripDetail/internal/StopItem";
import { apiClient } from "@/lib/api";
import { extractRouteNumber } from "@/lib/routeNumber";
import { trimTimeSeconds } from "@/lib/utils";

/**
 * Parse GTFS time string (HH:MM:SS) to a Date object.
 * Handles extended hours (>= 24 means next day).
 */
function parseGtfsTime(timeString: string, baseDate: Date): Date {
  const timeParts = timeString.split(":");
  if (timeParts.length < 2) {
    throw new Error(`Invalid time format: ${timeString}`);
  }

  let hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  const seconds = timeParts.length >= 3 ? parseInt(timeParts[2], 10) : 0;

  // Handle GTFS extended hours (hours >= 24 means next day)
  let daysToAdd = 0;
  if (hours >= 24) {
    daysToAdd = Math.floor(hours / 24);
    hours = hours % 24;
  }

  return new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate() + daysToAdd,
    hours,
    minutes,
    seconds,
    0
  );
}

/**
 * Calculate which stop the bus is currently at or between.
 * Returns the index of the stop the bus is currently at or has most recently passed.
 */
function calculateCurrentBusLocation(
  stopsData: TripTimedStop[],
  currentTime: Date
): number {
  let currentLocationIndex = -1;

  for (let i = 0; i < stopsData.length; i++) {
    try {
      const stopArrivalTime = parseGtfsTime(
        stopsData[i].arrival_time,
        currentTime
      );

      // If this stop's arrival time is in the future, the bus is between previous and this stop
      if (stopArrivalTime > currentTime) {
        // Return the previous stop index (or -1 if this is the first stop)
        return Math.max(-1, i - 1);
      }

      // This stop has been passed
      currentLocationIndex = i;
    } catch {
      console.warn(
        `Failed to parse arrival time for stop ${i}:`,
        stopsData[i].arrival_time
      );
    }
  }

  // If all stops are in the past, return the last stop (bus has completed the trip)
  return currentLocationIndex;
}

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // The URL contains %E5%B9%B3%E6%97%A5... which needs to be decoded to 平日_...
  // Then the HTTP client will re-encode it properly when making the API request
  const tripId =
    typeof params?.trip_id === "string"
      ? decodeURIComponent(params.trip_id)
      : "";
  const stopId = searchParams.get("stop_id") || undefined;

  const [stops, setStops] = useState<Stop[]>([]);
  const [tripInfo, setTripInfo] = useState<{
    routeNumber: string;
    routeName: string;
    destination: string;
    stopName: string;
    arrivalTime: string;
    arrivalMinutes: number;
    stopsAway: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawStopsData, setRawStopsData] = useState<TripTimedStop[]>([]);
  const [busLocationIndex, setBusLocationIndex] = useState<number>(-1);

  useEffect(() => {
    if (!tripId) {
      setError("Trip ID is required");
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();

    const fetchTripDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch trip info and stops in parallel
        const [tripInfoResponse, tripStopsResponse] = await Promise.all([
          apiClient.getTripInfo(tripId, abortController.signal),
          apiClient.getTripStops(tripId, abortController.signal),
        ]);

        if (tripInfoResponse.error || !tripInfoResponse.data) {
          throw new Error("Failed to fetch trip info");
        }

        if (tripStopsResponse.error || !tripStopsResponse.data) {
          throw new Error("Failed to fetch trip stops");
        }

        const tripData = tripInfoResponse.data;
        const stopsData = tripStopsResponse.data;

        // Get current stop info if stopId is provided
        let currentStopInfo = null;
        let currentStopIndex = -1;
        let currentStopName = "バス停";

        if (stopId) {
          currentStopIndex = stopsData.findIndex(
            (stop) => stop.stop_id === stopId
          );
          if (currentStopIndex >= 0) {
            const currentStop = stopsData[currentStopIndex];
            currentStopName = currentStop.stop_name || stopId;

            // Fetch passing info for the current stop
            try {
              const passingResponse = await apiClient.getTripPassing(
                tripId,
                stopId,
                abortController.signal
              );

              if (passingResponse.data) {
                currentStopInfo = passingResponse.data;
              }
            } catch (passingError) {
              console.warn("Failed to fetch passing info:", passingError);
            }
          }
        }

        // Calculate arrival minutes if we have current stop info
        let arrivalMinutes = 0;
        let arrivalTime = "";
        if (currentStopInfo) {
          arrivalTime = trimTimeSeconds(currentStopInfo.arrival_time);
          // Parse arrival_time to calculate minutes until arrival
          if (currentStopInfo.arrival_time) {
            const now = new Date();

            // Parse the time string (HH:MM:SS format)
            const timeParts = currentStopInfo.arrival_time.split(":");
            if (timeParts.length >= 2) {
              let hours = parseInt(timeParts[0], 10);
              const minutes = parseInt(timeParts[1], 10);

              // Handle GTFS extended hours (hours >= 24 means next day)
              let daysToAdd = 0;
              if (hours >= 24) {
                daysToAdd = Math.floor(hours / 24);
                hours = hours % 24;
              }

              // Create arrival datetime with today's date and the parsed time
              const arrivalDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + daysToAdd,
                hours,
                minutes,
                0,
                0
              );

              // If the arrival time is in the past (e.g., current time is 15:00 and arrival is 14:00),
              // assume it's for tomorrow
              if (arrivalDate < now && daysToAdd === 0) {
                arrivalDate.setDate(arrivalDate.getDate() + 1);
              }

              const diffMs = arrivalDate.getTime() - now.getTime();
              arrivalMinutes = Math.max(0, Math.round(diffMs / 60000));
            }
          }
        }

        // Calculate stops away (from first stop to current stop)
        const stopsAway = currentStopIndex >= 0 ? currentStopIndex : 0;

        // Store raw stops data for bus location calculation
        setRawStopsData(stopsData);

        // Calculate current bus location based on arrival times
        const busLocationIndex = calculateCurrentBusLocation(
          stopsData,
          new Date()
        );

        // Convert stops to component format
        const formattedStops: Stop[] = stopsData.map((stop, index) => ({
          id: stop.stop_id,
          name: stop.stop_name || stop.stop_id,
          arrivalTime: trimTimeSeconds(stop.arrival_time),
          fare:
            stop.fare !== undefined && stop.fare !== null
              ? stop.fare
              : undefined,
          isCurrent: stop.stop_id === stopId,
          isBusLocation: index === busLocationIndex && stop.stop_id !== stopId, // Bus is here, but not the user's selected stop
          isDestination:
            index === stopsData.length - 1 ||
            stop.stop_id === tripData.destination_stop_id,
          isPassed: busLocationIndex >= 0 && index < busLocationIndex,
        }));

        // Extract route number using the extraction system
        const routeNumber = extractRouteNumber({
          trip_id: tripId,
          route_short_name: tripData.route_name || undefined,
        });

        setStops(formattedStops);
        setTripInfo({
          routeNumber,
          routeName: tripData.route_name || "",
          destination: tripData.destination_display_name || "終点",
          stopName: currentStopName,
          arrivalTime,
          arrivalMinutes,
          stopsAway,
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error("Failed to fetch trip details:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load trip details"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTripDetails();

    return () => {
      abortController.abort();
    };
  }, [tripId, stopId]);

  // Update current time and recalculate bus location every minute
  useEffect(() => {
    if (rawStopsData.length === 0) return;

    // Function to update bus location based on current time
    const updateBusLocation = () => {
      const now = new Date();

      const newBusLocationIndex = calculateCurrentBusLocation(
        rawStopsData,
        now
      );

      // Update bus location index state
      setBusLocationIndex(newBusLocationIndex);

      // Update stops with new bus location
      setStops((prevStops) =>
        prevStops.map((stop, index) => ({
          ...stop,
          isBusLocation: index === newBusLocationIndex && stop.id !== stopId,
          isPassed: newBusLocationIndex >= 0 && index < newBusLocationIndex,
        }))
      );

      // Update arrival minutes if we have current stop info
      if (tripInfo && stopId) {
        const currentStopIndex = rawStopsData.findIndex(
          (s) => s.stop_id === stopId
        );
        if (currentStopIndex >= 0) {
          try {
            const arrivalDate = parseGtfsTime(
              rawStopsData[currentStopIndex].arrival_time,
              now
            );
            const diffMs = arrivalDate.getTime() - now.getTime();
            const newArrivalMinutes = Math.max(0, Math.round(diffMs / 60000));

            setTripInfo((prev) =>
              prev ? { ...prev, arrivalMinutes: newArrivalMinutes } : null
            );
          } catch (error) {
            console.warn("Failed to update arrival minutes:", error);
          }
        }
      }
    };

    // Initial update
    updateBusLocation();

    // Set up interval to update every minute
    // Calculate ms until next minute to sync with clock
    const now = new Date();
    const msUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    // First timeout to sync with minute boundary
    const syncTimeout = setTimeout(() => {
      updateBusLocation();
      // Then set up regular interval
      const interval = setInterval(updateBusLocation, 60000); // 60 seconds
      return () => clearInterval(interval);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(syncTimeout);
    };
  }, [rawStopsData, stopId, tripInfo]);

  // Scroll to bus location when it changes
  useEffect(() => {
    if (busLocationIndex >= 0 && stops.length > 0) {
      // Use a small delay to ensure DOM has updated
      const scrollTimer = setTimeout(() => {
        // Find the stop element with isBusLocation true
        const busLocationElement = document.querySelector(
          '[data-bus-location="true"]'
        );
        if (busLocationElement) {
          busLocationElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);

      return () => clearTimeout(scrollTimer);
    }
  }, [busLocationIndex, stops]);

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontSize: "16px",
          color: "var(--foregroundl2)",
        }}
      >
        読み込み中...
      </div>
    );
  }

  // Error state
  if (error || !tripInfo) {
    return (
      <ErrorFullScreen
        message={error || "トリップ情報を読み込めませんでした"}
      />
    );
  }

  return (
    <BusTripDetail
      tripId={tripId}
      stopId={stopId}
      stopName={tripInfo.stopName}
      routeNumber={tripInfo.routeNumber}
      routeName={tripInfo.routeName}
      destinationName={tripInfo.destination}
      arrivalMinutes={tripInfo.arrivalMinutes}
      arrivalTime={tripInfo.arrivalTime}
      departureTime={tripInfo.arrivalTime}
      stopsAway={tripInfo.stopsAway}
      stops={stops}
      routeColorText={tripInfo.routeName}
      onBack={() => router.back()}
    />
  );
}
