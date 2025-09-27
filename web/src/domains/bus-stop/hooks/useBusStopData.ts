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

        // Fetch upcoming buses with trip info expanded
        const upcomingResponse =
          await apiClient.getBusStopInfoExpanded(busStopId);
        const upcomingData = upcomingResponse.data as UpcomingBusEnrichedData;

        if (!upcomingData) {
          throw new Error("No data received from API");
        }

        // Get stop name using ApiClient
        let stopName = busStopId; // fallback
        try {
          const stopResponse = await apiClient.getStopNames(busStopId);
          const stopData = stopResponse.data as StopNameListData;
          if (stopData?.stop_names && stopData.stop_names.length > 0) {
            stopName = stopData.stop_names[0];
          }
        } catch (stopError) {
          console.warn("Failed to fetch stop name:", stopError);
          // Continue with fallback name
        }

        // Calculate distance using geolocation
        const distance = calculateDistance();

        // Convert API data to domain format
        const busStopInfo = convertUpcomingBusToBusStopInfo(
          upcomingData,
          stopName,
          distance
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
