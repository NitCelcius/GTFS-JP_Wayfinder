"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { ApiClient } from "@/lib/api";

import { composeBusStopInfoWithLatestSelection } from "../composition";
import { calculateDistanceBetweenCoords, formatDistance } from "../converter";
import type { StopNameListData, UpcomingBusEnrichedData } from "../types";
import { BusStopInfoV2 } from "./BusStopInfoV2";
import type { UpcomingBusInfo } from "./BusStopInfoV2";

interface BusStopInfoV2ContainerProps {
  busStopId?: string;
  onBack?: () => void;
  onNavigateToRoute?: () => void;
  initialData?: {
    upcomingData: UpcomingBusEnrichedData | null;
    stopData: StopNameListData | null;
  };
}

export function BusStopInfoV2Container({
  busStopId,
  onBack,
  onNavigateToRoute,
  initialData,
}: BusStopInfoV2ContainerProps) {
  const router = useRouter();
  const [busStopName, setBusStopName] = useState<string>("");
  const [distance, setDistance] = useState<string>("");
  const [pastBus, setPastBus] = useState<UpcomingBusInfo | null>(null);
  const [upcomingBuses, setUpcomingBuses] = useState<UpcomingBusInfo[]>([]);
  const [isLoading, setIsLoading] = useState(!initialData?.upcomingData);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  // Process initial data from SSR if available
  useEffect(() => {
    if (initialData?.upcomingData && initialData?.stopData) {
      const now = new Date();

      const upcomingData = initialData.upcomingData;
      const stopData = initialData.stopData;

      let stopName = busStopId || "";
      let platformCode: string | null = null;
      let lat: number | undefined;
      let lon: number | undefined;

      if (stopData?.stop_names && stopData.stop_names.length > 0) {
        stopName = stopData.stop_names[0];
      }
      if (stopData?.platform_code) {
        platformCode = stopData.platform_code;
      }
      if (stopData?.location) {
        lat = stopData.location.lat;
        lon = stopData.location.lon;
        // Store coordinates for walk navigation only if valid
        if (
          isFinite(lat) &&
          isFinite(lon) &&
          lat >= -90 &&
          lat <= 90 &&
          lon >= -180 &&
          lon <= 180
        ) {
          setCoordinates({ lat, lon });
        }
      }

      // Compose bus stop info without distance (will be calculated on client with geolocation)
      const busStopInfo = composeBusStopInfoWithLatestSelection(
        upcomingData,
        stopName,
        busStopId || "",
        {
          platformCode,
          distance: "", // No distance yet
          lat,
          lon,
          currentTime: now,
        }
      );

      // Convert to V2 format
      setBusStopName(busStopInfo.busStop?.name || stopName);

      // Convert buses to V2 format
      const convertedBuses: UpcomingBusInfo[] =
        busStopInfo.busesWithJourneys.map((bus) => ({
          tripId: bus.busInfo.tripId,
          routeNumber: bus.busInfo.line,
          routeName: bus.busInfo.system || "",
          destination: bus.busInfo.destination,
          destinationLabel: bus.busInfo.direction,
          minutesUntilDeparture: Math.round(
            (bus.busInfo.arrivalDatetime.getTime() - now.getTime()) / 60000
          ),
          departureTime: bus.busInfo.arrivalTime,
          cost: undefined, // TODO: Add fare info
          stopsUntilArrival: `${bus.routeJourney.length - 1}駅先に到着`,
          routeColorText: bus.busInfo.routeColorText,
        }));

      setUpcomingBuses(convertedBuses);
      setIsLoading(false);

      // Set past bus if available (first bus as reference)
      if (convertedBuses.length > 0) {
        setPastBus(null); // For now, we don't display past buses
      }
    }
  }, [initialData, busStopId]);

  // Fetch geolocation on client side (separate from main data)
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });

        // Calculate distance if we have coordinates
        if (coordinates) {
          const distanceKm = calculateDistanceBetweenCoords(
            position.coords.latitude,
            position.coords.longitude,
            coordinates.lat,
            coordinates.lon
          );
          setDistance(formatDistance(distanceKm));
        }
      },
      (error) => {
        console.warn("Geolocation error:", error);
        // Don't set error, just continue without distance
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, [coordinates]);

  // Fallback: Fetch data client-side if no initial data provided (for backward compatibility)
  useEffect(() => {
    if (initialData?.upcomingData) {
      // Already have SSR data, skip client-side fetch
      return;
    }

    if (!busStopId) {
      setError("Bus stop ID is required");
      return;
    }

    const abortController = new AbortController();

    const fetchBusStopData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiClient = ApiClient.getInstance();

        // Get current time in HH:MM:SS format
        const now = new Date();
        const beginTime = now.toTimeString().split(" ")[0];

        // Fetch upcoming buses with trip info
        const upcomingResponse = await apiClient.getBusStopInfoExpanded(
          busStopId,
          undefined,
          50,
          beginTime,
          abortController.signal
        );
        const upcomingData = upcomingResponse.data as UpcomingBusEnrichedData;

        if (!upcomingData) {
          throw new Error("No data received from API");
        }

        // Get stop info (name, platform_code and location)
        let stopName = busStopId;
        let platformCode: string | null = null;
        let lat: number | undefined;
        let lon: number | undefined;
        try {
          const stopResponse = await apiClient.getStopInfo(
            busStopId,
            true,
            abortController.signal
          );
          const stopData = stopResponse.data as StopNameListData;
          if (stopData?.stop_names && stopData.stop_names.length > 0) {
            stopName = stopData.stop_names[0];
          }
          if (stopData?.platform_code) {
            platformCode = stopData.platform_code;
          }
          if (stopData?.location) {
            lat = stopData.location.lat;
            lon = stopData.location.lon;
            // Store coordinates for walk navigation only if valid
            if (
              isFinite(lat) &&
              isFinite(lon) &&
              lat >= -90 &&
              lat <= 90 &&
              lon >= -180 &&
              lon <= 180
            ) {
              setCoordinates({ lat, lon });
            }
          }
        } catch (stopError) {
          console.warn("Failed to fetch stop info:", stopError);
        }

        // Calculate distance
        // Distance will be calculated separately with geolocation

        // Compose bus stop info
        const busStopInfo = composeBusStopInfoWithLatestSelection(
          upcomingData,
          stopName,
          busStopId,
          {
            platformCode,
            distance: "", // Distance will be calculated with geolocation
            lat,
            lon,
            currentTime: now,
          }
        );

        // Convert to V2 format
        setBusStopName(busStopInfo.busStop?.name || stopName);
        // Distance will be set by geolocation effect

        // Convert buses to V2 format
        const convertedBuses: UpcomingBusInfo[] =
          busStopInfo.busesWithJourneys.map((bus) => {
            // Find the current stop (this page's stop) in the journey
            const currentStopIndex = bus.routeJourney.findIndex(
              (stop) => stop.type === "current"
            );

            // Calculate stops until arrival at this stop
            // currentStopIndex represents position of this stop in the route
            let stopsUntilArrival: string;
            if (currentStopIndex === -1) {
              // Current stop not found in journey - shouldn't happen but handle gracefully
              stopsUntilArrival = "位置情報なし";
            } else if (currentStopIndex === 0) {
              // This stop is the first stop on the route
              stopsUntilArrival = "まもなく到着";
            } else {
              // Show number of stops from start to this stop
              stopsUntilArrival = `${currentStopIndex}駅先に到着`;
            }

            return {
              tripId: bus.busInfo.tripId,
              routeNumber: bus.busInfo.line,
              routeName: bus.busInfo.system || "",
              destination: bus.busInfo.destination,
              destinationLabel: bus.busInfo.direction,
              minutesUntilDeparture: Math.round(
                (bus.busInfo.arrivalDatetime.getTime() - now.getTime()) / 60000
              ),
              departureTime: bus.busInfo.arrivalTime,
              cost: undefined, // TODO: Add fare info
              stopsUntilArrival,
              routeColorText: bus.busInfo.routeColorText,
            };
          });

        // Separate past buses from upcoming buses
        const pastBuses = convertedBuses.filter(
          (bus) => bus.minutesUntilDeparture < 0
        );
        const futureBuses = convertedBuses.filter(
          (bus) => bus.minutesUntilDeparture >= 0
        );

        // Set upcoming buses immediately (priority for UX)
        setUpcomingBuses(futureBuses);
        setIsLoading(false);

        // Defer past bus loading to improve perceived performance
        // This allows upcoming buses to be displayed first
        setTimeout(() => {
          // Set the most recent past bus
          // We find the largest negative value (closest to 0) because:
          // - Past buses have negative minutesUntilDeparture (e.g., -5, -10, -15)
          // - The largest negative value (-5) represents the most recently departed bus
          // - This is the most relevant past bus for users to see
          if (pastBuses.length > 0) {
            const mostRecentPastBus = pastBuses.reduce((prev, current) =>
              current.minutesUntilDeparture > prev.minutesUntilDeparture
                ? current
                : prev
            );
            setPastBus({ ...mostRecentPastBus, isPast: true });
          } else {
            setPastBus(null);
          }
        }, 100);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error("Failed to fetch bus stop data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load bus stop data"
        );
        setIsLoading(false);
      }
    };

    fetchBusStopData();

    return () => {
      abortController.abort();
    };
  }, [busStopId, initialData]);

  return (
    <BusStopInfoV2
      busStopId={busStopId}
      busStopName={busStopName || busStopId || "バス停"}
      distance={distance || undefined}
      pastBus={pastBus}
      upcomingBuses={upcomingBuses}
      isLoading={isLoading}
      error={error}
      onBack={onBack || (() => router.push("/bus-stop"))}
      onRoutineSearch={onNavigateToRoute || (() => router.push("/"))}
      hasValidCoordinates={coordinates !== null && userLocation !== null}
      onWalkDirections={() => {
        if (!coordinates) {
          console.error(
            "Cannot open walking directions: coordinates not available"
          );
          alert("位置情報が取得できませんでした。徒歩案内を表示できません。");
          return;
        }
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lon}&travelmode=walking`;
        window.open(mapsUrl, "_blank", "noopener,noreferrer");
      }}
      onTransfer={() => console.log("Transfer")} // TODO: Implement transition to transfer search
      onRouteList={() => console.log("Route list")} // TODO: Implement transition to route list
      onBusClick={(bus) => {
        const params = new URLSearchParams();
        if (busStopId) {
          params.set("stop_id", busStopId);
        }
        router.push(`/trips/${bus.tripId}?${params.toString()}`);
      }}
    />
  );
}
