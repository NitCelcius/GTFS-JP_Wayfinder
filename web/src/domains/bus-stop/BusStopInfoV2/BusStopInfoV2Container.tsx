import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { ApiClient } from "@/lib/api";

import { composeBusStopInfoWithLatestSelection } from "../composition";
import { calculateDistance } from "../converter";
import type { StopNameListData, UpcomingBusEnrichedData } from "../types";
import { BusStopInfoV2 } from "./BusStopInfoV2";
import type { UpcomingBusInfo } from "./BusStopInfoV2";

interface BusStopInfoV2ContainerProps {
  busStopId?: string;
  onBack?: () => void;
  onNavigateToRoute?: () => void;
}

export function BusStopInfoV2Container({
  busStopId,
  onBack,
  onNavigateToRoute,
}: BusStopInfoV2ContainerProps) {
  const router = useRouter();
  const [busStopName, setBusStopName] = useState<string>("");
  const [distance, setDistance] = useState<string>("");
  const [pastBus, setPastBus] = useState<UpcomingBusInfo | null>(null);
  const [upcomingBuses, setUpcomingBuses] = useState<UpcomingBusInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  useEffect(() => {
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
        const calculatedDistance = calculateDistance();

        // Compose bus stop info
        const busStopInfo = composeBusStopInfoWithLatestSelection(
          upcomingData,
          stopName,
          busStopId,
          {
            platformCode,
            distance: calculatedDistance,
            lat,
            lon,
            currentTime: now,
          }
        );

        // Convert to V2 format
        setBusStopName(busStopInfo.busStop?.name || stopName);
        setDistance(busStopInfo.busStop?.distance || calculatedDistance);

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
          }));

        setUpcomingBuses(convertedBuses);

        // Set past bus if available (first bus as reference)
        if (convertedBuses.length > 0) {
          setPastBus(null); // For now, we don't display past buses
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error("Failed to fetch bus stop data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load bus stop data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusStopData();

    return () => {
      abortController.abort();
    };
  }, [busStopId]);

  return (
    <BusStopInfoV2
      busStopId={busStopId}
      busStopName={busStopName || busStopId || "バス停"}
      distance={distance || undefined}
      pastBus={pastBus}
      upcomingBuses={upcomingBuses}
      isLoading={isLoading}
      error={error}
      onBack={onBack}
      onRoutineSearch={onNavigateToRoute}
      hasValidCoordinates={coordinates !== null}
      onWalkDirections={() => {
        if (!coordinates) {
          console.error(
            "Cannot open walking directions: coordinates not available"
          );
          alert("位置情報が取得できませんでした。徒歩案内を表示できません。");
          return;
        }
        // Google Maps URL with walking directions from current location
        // On mobile devices, this will typically open the native maps app
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
