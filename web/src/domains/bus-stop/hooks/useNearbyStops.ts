import { useEffect, useState } from "react";

import { ApiClient } from "@/lib/api";

import { convertNearbyStopToBusStop } from "../converter";
import type { BusStop, NearbyStopsResponse } from "../types";

interface GeolocationState {
  loading: boolean;
  error: string | null;
  position: GeolocationPosition | null;
}

interface UseNearbyStopsResult {
  nearbyStops: BusStop[];
  isLoading: boolean;
  error: string | null;
  hasLocationPermission: boolean;
}

/**
 * Custom hook to get user's location using the Geolocation API
 */
export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    position: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        loading: false,
        error: "Geolocation is not supported by this browser",
        position: null,
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const successCallback = (position: GeolocationPosition) => {
      setState({
        loading: false,
        error: null,
        position,
      });
    };

    const errorCallback = (error: GeolocationPositionError) => {
      let errorMessage = "An unknown error occurred";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location access denied";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out";
          break;
      }

      setState({
        loading: false,
        error: errorMessage,
        position: null,
      });
    };

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
    });
  }, []);

  return state;
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
