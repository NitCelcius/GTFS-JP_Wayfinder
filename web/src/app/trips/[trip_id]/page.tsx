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
  parseGtfsTimeNoWrap,
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
  // Decode stop_id: handle + as space (URL query string convention) and decode URI components
  const stopIdRaw = searchParams.get("stop_id");
  const stopId = stopIdRaw
    ? decodeURIComponent(stopIdRaw.replace(/\+/g, " "))
    : undefined;

  const [stops, setStops] = useState<Stop[]>([]);
  const [tripInfo, setTripInfo] = useState<{
    routeNumber: string;
    routeName: string;
    destination: string;
    stopName: string;
    arrivalTime: string;
    arrivalMinutes: number;
    stopsAway: number;
    stopsUntilArrival: number | null; // null = bus hasn't departed, number = stops between bus and user's stop
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

            // Calculate arrival minutes using GTFS time parsing
            // Use parseGtfsTimeNoWrap to allow negative values for past buses
            if (currentStop.arrival_time) {
              try {
                const now = new Date();
                const arrivalDate = parseGtfsTimeNoWrap(
                  currentStop.arrival_time,
                  now
                );
                const diffMs = arrivalDate.getTime() - now.getTime();
                arrivalMinutes = Math.round(diffMs / 60000);
              } catch (error) {
                console.error("Failed to parse arrival time:", error);
                arrivalMinutes = 0;
              }
            }
          }
        }

        // Calculate stops away (from first stop to current stop)
        // This represents how many stops the bus travels from its origin to reach this stop
        const stopsAway = currentStopIndex >= 0 ? currentStopIndex : 0;

        // Store raw stops data for bus location calculation
        setRawStopsData(stopsData);

        // Calculate current bus location based on arrival times
        const now = new Date();
        const busLocationIndex = calculateCurrentBusLocation(stopsData, now);

        // Calculate stopsUntilArrival for en-route buses
        // - null if bus hasn't departed (busLocationIndex === -1)
        // - 0 if bus has passed or is at user's stop
        // - positive number = actual stops between bus and user's stop
        let stopsUntilArrival: number | null;
        if (busLocationIndex === -1) {
          // Bus hasn't departed yet
          stopsUntilArrival = null;
        } else if (currentStopIndex < 0) {
          // Current stop not found
          stopsUntilArrival = null;
        } else if (busLocationIndex >= currentStopIndex) {
          // Bus has passed or is at user's stop
          stopsUntilArrival = 0;
        } else {
          // Bus is en route, calculate actual stops until arrival
          stopsUntilArrival = currentStopIndex - busLocationIndex;
        }

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
          stopsUntilArrival,
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

      // Update arrival minutes and stopsUntilArrival if we have current stop info
      if (stopId) {
        const currentStopIndex = rawStopsData.findIndex(
          (s) => s.stop_id === stopId
        );
        if (currentStopIndex >= 0) {
          try {
            const currentStop = rawStopsData[currentStopIndex];
            if (currentStop.arrival_time) {
              const arrivalDate = parseGtfsTimeNoWrap(
                currentStop.arrival_time,
                now
              );
              const diffMs = arrivalDate.getTime() - now.getTime();
              const newArrivalMinutes = Math.round(diffMs / 60000);

              // Calculate updated stopsUntilArrival based on new bus location
              let newStopsUntilArrival: number | null;
              if (newBusLocationIndex === -1) {
                newStopsUntilArrival = null;
              } else if (newBusLocationIndex >= currentStopIndex) {
                newStopsUntilArrival = 0;
              } else {
                newStopsUntilArrival = currentStopIndex - newBusLocationIndex;
              }

              setTripInfo((prev) =>
                prev
                  ? {
                      ...prev,
                      arrivalMinutes: newArrivalMinutes,
                      stopsUntilArrival: newStopsUntilArrival,
                    }
                  : null
              );
            }
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
      stopsUntilArrival={tripInfo.stopsUntilArrival}
      stops={stops}
      routeColorText={tripInfo.routeColorText}
      onBack={() => router.back()}
    />
  );
}
