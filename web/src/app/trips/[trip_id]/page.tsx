"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter, useSearchParams } from "next/navigation";

import { ErrorFullScreen } from "@/components/common";
import { BusTripDetail } from "@/domains/bus-stop";
import type { Stop } from "@/domains/bus-stop/BusTripDetail/internal/StopItem";
import { apiClient } from "@/lib/api";
import { extractRouteNumber } from "@/lib/routeNumber";

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
          arrivalTime = currentStopInfo.arrival_time;
          // Parse arrival_datetime if available
          if (currentStopInfo.arrival_datetime) {
            const arrivalDate = new Date(currentStopInfo.arrival_datetime);
            const now = new Date();
            const diffMs = arrivalDate.getTime() - now.getTime();
            arrivalMinutes = Math.max(0, Math.round(diffMs / 60000));
          }
        }

        // Calculate stops away (from first stop to current stop)
        const stopsAway = currentStopIndex >= 0 ? currentStopIndex : 0;

        // Convert stops to component format
        const formattedStops: Stop[] = stopsData.map((stop, index) => ({
          id: stop.stop_id,
          name: stop.stop_name || stop.stop_id,
          arrivalTime: stop.arrival_time,
          fare: undefined, // Fare would need to be calculated from current stop
          isCurrent: stop.stop_id === stopId,
          isBusLocation: false, // We don't have live bus location from this endpoint
          isDestination:
            index === stopsData.length - 1 ||
            stop.stop_id === tripData.destination_stop_id,
          isPassed: currentStopIndex >= 0 && index < currentStopIndex,
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
      stopName={tripInfo.stopName}
      routeNumber={tripInfo.routeNumber}
      routeName={tripInfo.routeName}
      destinationName={tripInfo.destination}
      arrivalMinutes={tripInfo.arrivalMinutes}
      arrivalTime={tripInfo.arrivalTime}
      stopsAway={tripInfo.stopsAway}
      stops={stops}
      onBack={() => router.back()}
    />
  );
}
