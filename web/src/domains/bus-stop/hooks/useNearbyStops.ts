import { useEffect, useState } from "react";

import { useGeolocation } from "@/hooks/useGeolocation";
import { ApiClient } from "@/lib/api";

import { convertNearbyStopToBusStop } from "../converter";
import type { BusStop, NearbyStopsResponse } from "../types";

interface UseNearbyStopsResult {
  nearbyStops: BusStop[];
  isLoading: boolean;
  error: string | null;
  hasLocationPermission: boolean;
}

/**
 * Custom hook to fetch nearby bus stops based on user location
 */
export function useNearbyStops(): UseNearbyStopsResult {
  const [nearbyStops, setNearbyStops] = useState<BusStop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    loading: locationLoading,
    error: locationError,
    position,
  } = useGeolocation();

  const hasLocationPermission = !locationError && position !== null;

  useEffect(() => {
    if (locationLoading || locationError || !position) {
      return;
    }

    const fetchNearbyStops = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const apiClient = ApiClient.getInstance();
        const response = await apiClient.getNearbyStops(
          position.coords.latitude,
          position.coords.longitude,
          10 // limit to 10 stops
        );

        const nearbyData = response.data as NearbyStopsResponse;
        const busStops = nearbyData.stops.map(convertNearbyStopToBusStop);
        setNearbyStops(busStops);
      } catch (err) {
        console.error("Failed to fetch nearby stops:", err);
        setError("近くのバス停を取得できませんでした");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNearbyStops();
  }, [position, locationLoading, locationError]);

  return {
    nearbyStops,
    isLoading: isLoading || locationLoading,
    error: error || locationError,
    hasLocationPermission,
  };
}
