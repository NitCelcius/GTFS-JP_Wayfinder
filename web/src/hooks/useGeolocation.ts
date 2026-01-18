import { useEffect, useState } from "react";

interface GeolocationState {
  loading: boolean;
  error: string | null;
  position: GeolocationPosition | null;
}

/**
 * Custom hook to get user's location using the Geolocation API
 * This hook is shared across the application for consistent geolocation handling
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
