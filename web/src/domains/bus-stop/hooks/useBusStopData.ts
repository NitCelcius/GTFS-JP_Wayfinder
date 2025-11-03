import { useEffect, useState } from "react";

import { ApiClient } from "@/lib/api";

import {
  calculateDistance,
  convertUpcomingBusToBusStopInfo,
} from "../converter";
import type {
  BusStopInfo,
  StopNameListData,
  UpcomingBusEnrichedData,
} from "../types";

interface UseBusStopDataResult {
  data: BusStopInfo | null;
  isLoading: boolean;
  error: string | null;
}

export function useBusStopData(busStopId?: string): UseBusStopDataResult {
  const [data, setData] = useState<BusStopInfo | null>(null);
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

        // Pass current time to API to ensure timezone-aware bus filtering
        // Use HH:MM:SS format which the API treats as today's date in the server timezone
        const now = new Date();
        const beginTime = now.toTimeString().split(" ")[0]; // "HH:MM:SS"

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

        // Get stop info (name and location) using ApiClient
        let stopName = busStopId; // fallback
        let lat: number | undefined;
        let lon: number | undefined;
        try {
          const stopResponse = await apiClient.getStopInfo(busStopId, true);
          const stopData = stopResponse.data as StopNameListData;
          if (stopData?.stop_names && stopData.stop_names.length > 0) {
            stopName = stopData.stop_names[0];
          }
          if (stopData?.location) {
            lat = stopData.location.lat;
            lon = stopData.location.lon;
          }
        } catch (stopError) {
          console.warn("Failed to fetch stop info:", stopError);
          // Continue with fallback name
        }

        // Calculate distance using geolocation
        const distance = calculateDistance();

        // Convert API data to domain format, passing current time for intelligent bus selection
        const busStopInfo = convertUpcomingBusToBusStopInfo(
          upcomingData,
          stopName,
          distance,
          lat,
          lon,
          new Date() // Pass current time so converter can pick last bus if all have passed
        );

        setData(busStopInfo);
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

  return { data, isLoading, error };
}
