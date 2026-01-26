"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { ApiClient } from "@/lib/api";

import { composeBusStopInfoWithLatestSelection } from "../composition";
import {
  calculateDistanceBetweenCoords,
  calculateMinutesUntilArrival,
  formatDistance,
} from "../converter";
import {
  type PlatformInfo,
  PlatformSwitchModal,
} from "../internal/PlatformSwitchModal";
import type {
  RelatedPlatformsResponse,
  StopNameListData,
  UpcomingBusEnrichedData,
} from "../types";
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
  const [platformCode, setPlatformCode] = useState<string | null>(null);
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

  // Platform switching modal state
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
  const [isPlatformsLoading, setIsPlatformsLoading] = useState(false);
  const [platformsError, setPlatformsError] = useState<string | null>(null);
  const platformAbortControllerRef = useRef<AbortController | null>(null);

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

      // Separate past buses from upcoming buses
      const pastBuses = convertedBuses.filter(
        (bus) => bus.minutesUntilDeparture < 0
      );
      const futureBuses = convertedBuses.filter(
        (bus) => bus.minutesUntilDeparture >= 0
      );

      // Set upcoming buses (only future buses)
      setUpcomingBuses(futureBuses);
      setIsLoading(false);

      // Set the most recent past bus
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

        // Get time 30 minutes ago to include recently departed buses
        const now = new Date();
        const pastTime = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
        const beginTime = pastTime.toTimeString().split(" ")[0];

        // Fetch upcoming buses with trip info (includes buses from 30 min ago)
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
        let stopPlatformCode: string | null = null;
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
            stopPlatformCode = stopData.platform_code;
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
        setPlatformCode(stopPlatformCode);
        // Distance will be set by geolocation effect

        // Convert buses to V2 format
        const convertedBuses: UpcomingBusInfo[] =
          busStopInfo.busesWithJourneys.map((bus) => {
            // Find the current stop (this page's stop) in the journey
            const currentStopIndex = bus.routeJourney.findIndex(
              (stop) => stop.type === "current"
            );

            // Calculate bus location based on arrival times
            // Find the last stop the bus has passed (arrivalDatetime <= now)
            let busLocationIndex = -1;
            for (let i = 0; i < bus.routeJourney.length; i++) {
              const stopArrivalTime = bus.routeJourney[i].arrivalDatetime;
              if (stopArrivalTime <= now) {
                busLocationIndex = i;
              } else {
                break; // Future stops
              }
            }

            // Calculate minutes until departure at user's stop
            const minutesUntilDeparture = calculateMinutesUntilArrival(
              bus.busInfo.arrivalDatetime.toISOString(),
              now
            );

            // Calculate stops until arrival based on bus state:
            // - Past bus (minutesUntilDeparture < 0): Show "X駅先に到着" (stops from origin)
            // - En-route bus: Show "X駅前に到着" (remaining stops)
            // - Not yet departed: Don't show anything
            let stopsUntilArrival: string;
            if (currentStopIndex === -1) {
              // Current stop not found in journey
              stopsUntilArrival = "位置情報なし";
            } else if (minutesUntilDeparture < 0) {
              // Past bus - show how many stops it traveled from origin
              stopsUntilArrival =
                currentStopIndex === 0
                  ? "まもなく到着"
                  : `${currentStopIndex}駅先に到着`;
            } else if (busLocationIndex === -1) {
              // Bus hasn't departed yet - don't show stops info
              stopsUntilArrival = "";
            } else if (busLocationIndex >= currentStopIndex) {
              // Bus has passed or is at user's stop
              stopsUntilArrival = "まもなく到着";
            } else {
              // En-route bus - show remaining stops until arrival
              const remainingStops = currentStopIndex - busLocationIndex;
              stopsUntilArrival =
                remainingStops === 0
                  ? "まもなく到着"
                  : `${remainingStops}駅前に到着`;
            }

            return {
              tripId: bus.busInfo.tripId,
              routeNumber: bus.busInfo.line,
              routeName: bus.busInfo.system || "",
              destination: bus.busInfo.destination,
              destinationLabel: bus.busInfo.direction,
              minutesUntilDeparture,
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

  // Fetch related platforms when modal is opened
  const handleOpenPlatformModal = useCallback(async () => {
    if (!busStopId) return;

    // Abort any in-flight request to prevent race conditions
    platformAbortControllerRef.current?.abort();
    platformAbortControllerRef.current = new AbortController();

    setIsPlatformModalOpen(true);
    setIsPlatformsLoading(true);
    setPlatformsError(null);

    try {
      const apiClient = ApiClient.getInstance();
      const response = await apiClient.getRelatedPlatforms(
        busStopId,
        platformAbortControllerRef.current.signal
      );
      const data = response.data as RelatedPlatformsResponse;

      if (data?.stops) {
        const platformInfoList: PlatformInfo[] = data.stops.map((stop) => ({
          stopId: stop.stop_id,
          stopName: stop.stop_name,
          platformCode: stop.platform_code ?? null,
          lat: stop.lat,
          lon: stop.lon,
        }));
        setPlatforms(platformInfoList);
      } else {
        // Fallback: if API returns no stops, show empty state in modal
        setPlatforms([]);
      }
    } catch (err) {
      // Ignore AbortError - request was intentionally cancelled
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      console.error("Failed to fetch related platforms:", err);
      setPlatformsError(
        err instanceof Error ? err.message : "Failed to load platforms"
      );
    } finally {
      setIsPlatformsLoading(false);
    }
  }, [busStopId]);

  const handlePlatformSelect = useCallback(
    (platform: PlatformInfo) => {
      // Navigate to the selected platform's bus stop page
      router.push(`/bus-stop/${platform.stopId}`);
      setIsPlatformModalOpen(false);
    },
    [router]
  );

  return (
    <>
      <BusStopInfoV2
        busStopId={busStopId}
        // Fallback: if busStopName is not loaded yet, show busStopId; if neither, show default "バス停"
        busStopName={busStopName || busStopId || "バス停"}
        platformCode={platformCode}
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
        onTransfer={handleOpenPlatformModal}
        onRouteList={() => console.log("Route list")} // TODO: Implement transition to route list
        onBusClick={(bus) => {
          const params = new URLSearchParams();
          if (busStopId) {
            params.set("stop_id", busStopId);
          }
          router.push(`/trips/${bus.tripId}?${params.toString()}`);
        }}
      />
      <PlatformSwitchModal
        isOpen={isPlatformModalOpen}
        onClose={() => setIsPlatformModalOpen(false)}
        onPlatformSelect={handlePlatformSelect}
        currentStopId={busStopId}
        platforms={platforms}
        isLoading={isPlatformsLoading}
        error={platformsError}
      />
    </>
  );
}
