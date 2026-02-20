import { useEffect, useState } from "react";

import { ApiClient } from "@/lib/api";
import { getJSTTimeString } from "@/lib/timeUtils";

import { composeBusStopInfoWithLatestSelection } from "../composition";
import type {
  BusStopInfo,
  BusWithJourney,
  StopNameListData,
  UpcomingBusEnrichedData,
} from "../types";

interface UseBusStopDataReturn {
  busStop: BusStopInfo["busStop"] | null;
  busesWithJourneys: BusWithJourney[];
  bestBusIndex: number;
  isLoading: boolean;
  error: string | null;
}

export function useBusStopData(busStopId?: string): UseBusStopDataReturn {
  const [composedData, setComposedData] = useState<BusStopInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!busStopId) {
      setIsLoading(false);
      setError("Bus stop ID is required");
      return;
    }

    const fetchBusStopData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiClient = ApiClient.getInstance();

        // Pass current time in JST to API to ensure correct bus filtering.
        // The GTFS schedule is in JST; using server-local or browser time
        // could send the wrong begin_time if the user/server is in another TZ.
        const beginTime = getJSTTimeString();

        // Fetch multiple upcoming buses with trip info expanded to allow filtering
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

        // Get stop info (name, platform_code and location) using ApiClient
        let stopName = busStopId; // fallback
        let platformCode: string | null = null;
        let lat: number | undefined;
        let lon: number | undefined;
        try {
          const stopResponse = await apiClient.getStopInfo(busStopId, true);
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
          }
        } catch (stopError) {
          console.warn("Failed to fetch stop info:", stopError);
          // Continue with fallback name
        }

        // Calculate distance using geolocation (deprecated path - needs refactoring)
        // This hook needs to be updated to use the new geolocation logic
        const distance = "";

        // Convert API data to domain format with intelligent bus selection
        const busStopInfo = composeBusStopInfoWithLatestSelection(
          upcomingData,
          stopName,
          busStopId,
          {
            platformCode,
            distance,
            lat,
            lon,
            currentTime: new Date(), // Pass current time so logic picks best bus
          }
        );

        setComposedData(busStopInfo);
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

  // Expose the structured data the component needs
  return {
    busStop: composedData?.busStop ?? null,
    busesWithJourneys: composedData?.busesWithJourneys ?? [],
    bestBusIndex: composedData?.bestBusIndex ?? 0,
    isLoading,
    error,
  };
}
