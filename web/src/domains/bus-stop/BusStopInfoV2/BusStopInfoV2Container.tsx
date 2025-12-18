import { useEffect, useState } from "react";

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
  const [busStopName, setBusStopName] = useState<string>("");
  const [distance, setDistance] = useState<string>("");
  const [pastBus, setPastBus] = useState<UpcomingBusInfo | null>(null);
  const [upcomingBuses, setUpcomingBuses] = useState<UpcomingBusInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!busStopId) {
      setError("Bus stop ID is required");
      return;
    }

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
          beginTime
        );
        const upcomingData = upcomingResponse.data as UpcomingBusEnrichedData;

        if (!upcomingData) {
          throw new Error("No data received from API");
        }

        // Get stop info (name and location)
        let stopName = busStopId;
        try {
          const stopResponse = await apiClient.getStopInfo(busStopId, true);
          const stopData = stopResponse.data as StopNameListData;
          if (stopData?.stop_names && stopData.stop_names.length > 0) {
            stopName = stopData.stop_names[0];
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
          calculatedDistance,
          undefined,
          undefined,
          now
        );

        // Convert to V2 format
        setBusStopName(busStopInfo.busStop?.name || stopName);
        setDistance(busStopInfo.busStop?.distance || calculatedDistance);

        // Convert buses to V2 format
        const convertedBuses: UpcomingBusInfo[] =
          busStopInfo.busesWithJourneys.map((bus) => ({
            tripId: bus.busInfo.tripId,
            // TODO : Use system for route number when available
            routeNumber: "", // bus.busInfo.system || bus.busInfo.line,
            routeName: bus.busInfo.line,
            destination: bus.busInfo.destination,
            destinationLabel: bus.busInfo.direction,
            minutesUntilDeparture: Math.round(
              (bus.busInfo.arrivalDatetime.getTime() - now.getTime()) / 60000
            ),
            departureTime: bus.busInfo.arrivalTime,
            cost: parseInt(bus.busInfo.system || "0") || undefined,
            stopsUntilArrival: `${bus.routeJourney.length - 1}駅先に到着`,
          }));

        setUpcomingBuses(convertedBuses);

        // Set past bus if available (first bus as reference)
        if (convertedBuses.length > 0) {
          setPastBus(null); // For now, we don't display past buses
        }
      } catch (err) {
        console.error("Failed to fetch bus stop data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load bus stop data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusStopData();
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
      onWalkDirections={() => console.log("Walk directions")}
      onTransfer={() => console.log("Transfer")}
      onRouteList={() => console.log("Route list")}
      onBusClick={(bus) => console.log("Bus clicked:", bus)}
    />
  );
}
