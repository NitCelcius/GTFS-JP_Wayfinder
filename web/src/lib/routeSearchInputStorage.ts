/**
 * localStorage utility for persisting route search input state
 * Inputs are saved with a timestamp and expire after 1 hour
 */

const STORAGE_KEY = "gtfs-route-search-inputs";
const EXPIRY_TIME_MS = 60 * 60 * 1000; // 1 hour in milliseconds

export interface RouteSearchInputState {
  originStopId: string;
  destinationStopId: string;
  originStopName: string;
  destinationStopName: string;
  originCandidateStopIds: string[];
  destinationCandidateStopIds: string[];
  timestamp: number;
}

/**
 * Save route search inputs to localStorage with current timestamp
 */
export function saveRouteSearchInputs(state: {
  originStopId: string;
  destinationStopId: string;
  originStopName: string;
  destinationStopName: string;
  originCandidateStopIds: string[];
  destinationCandidateStopIds: string[];
}): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  const storageState: RouteSearchInputState = {
    ...state,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageState));
  } catch (error) {
    console.error("Failed to save route search inputs:", error);
  }
}

/**
 * Get route search inputs from localStorage if they exist and haven't expired (1 hour)
 * Returns null if not found or expired
 */
export function getRouteSearchInputs(): RouteSearchInputState | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const state: RouteSearchInputState = JSON.parse(stored);
    const now = Date.now();
    const elapsed = now - state.timestamp;

    // Check if data has expired (more than 1 hour old)
    if (elapsed > EXPIRY_TIME_MS) {
      clearRouteSearchInputs();
      return null;
    }

    return state;
  } catch (error) {
    console.error("Failed to get route search inputs:", error);
    return null;
  }
}

/**
 * Clear route search inputs from localStorage
 */
export function clearRouteSearchInputs(): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear route search inputs:", error);
  }
}
