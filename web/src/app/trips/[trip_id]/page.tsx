"use client";

import { useEffect, useRef, useState } from "react";

import { useParams, useRouter, useSearchParams } from "next/navigation";

import type { TripTimedStop } from "@/api/types.gen";
import { ErrorFullScreen } from "@/components/common";
import { BusTripDetail } from "@/domains/bus-stop";
import type { Stop } from "@/domains/bus-stop/BusTripDetail/internal/StopItem";
import { apiClient } from "@/lib/api";
import { extractRouteNumber } from "@/lib/routeNumber";
import {
  calculateCurrentBusLocation,
  parseGtfsTime,
  trimTimeSeconds,
} from "@/lib/utils";

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
    routeId?: string;
    routeColorText?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawStopsData, setRawStopsData] = useState<TripTimedStop[]>([]);
  const [busLocationIndex, setBusLocationIndex] = useState<number>(-1);
  const hasAutoScrolledRef = useRef(false);

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
        let currentStopIndex = -1;
        let currentStopName = "バス停";
        let arrivalMinutes = 0;
        let arrivalTime = "";

        if (stopId) {
          currentStopIndex = stopsData.findIndex(
            (stop) => stop.stop_id === stopId
          );
          if (currentStopIndex >= 0) {
            const currentStop = stopsData[currentStopIndex];
            currentStopName = currentStop.stop_name || stopId;
            arrivalTime = currentStop.arrival_time;

            // Calculate arrival minutes from the stop's datetime
            if (currentStop.arrival_datetime) {
              // API returns datetime with reference date (e.g., "2021-01-01T12:53:00")
              // Extract time and combine with today's date for accurate calculation
              const arrivalDate = new Date(currentStop.arrival_datetime);
              const now = new Date();

              // Create a new date with today's date but the arrival time
              const todayArrival = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                arrivalDate.getHours(),
                arrivalDate.getMinutes(),
                arrivalDate.getSeconds()
              );

              const diffMs = todayArrival.getTime() - now.getTime();
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
          arrivalTime: trimTimeSeconds(arrivalTime),
          arrivalMinutes,
          stopsAway,
          routeId: tripData.route_id ?? undefined,
          routeColorText: tripData.route_id ?? tripData.route_name ?? undefined,
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
      if (stopId) {
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

    // Track interval so we can clean it up when the effect is disposed
    let interval: ReturnType<typeof setInterval> | null = null;

    // First timeout to sync with minute boundary
    const syncTimeout = setTimeout(() => {
      updateBusLocation();
      // Then set up regular interval
      interval = setInterval(updateBusLocation, 60000); // 60 seconds
    }, msUntilNextMinute);

    return () => {
      clearTimeout(syncTimeout);
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [rawStopsData, stopId]);

  // Scroll to bus location on initial load only
  useEffect(() => {
    if (
      busLocationIndex >= 0 &&
      stops.length > 0 &&
      !hasAutoScrolledRef.current
    ) {
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
          hasAutoScrolledRef.current = true;
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
      routeColorText={tripInfo.routeColorText}
      onBack={() => router.back()}
    />
  );
}
