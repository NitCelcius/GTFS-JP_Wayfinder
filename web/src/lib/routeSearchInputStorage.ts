/**
 * sessionStorage utility for persisting route search input state
 * Inputs are saved with a timestamp and expire after 5 minutes
 */

const STORAGE_KEY = "gtfs-route-search-inputs";
const EXPIRY_TIME_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

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
 * Save route search inputs to sessionStorage with current timestamp
 */
export function saveRouteSearchInputs(state: {
  originStopId: string;
  destinationStopId: string;
  originStopName: string;
  destinationStopName: string;
  originCandidateStopIds: string[];
  destinationCandidateStopIds: string[];
}): void {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }

  const storageState: RouteSearchInputState = {
    ...state,
    timestamp: Date.now(),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storageState));
  } catch (error) {
    console.error("Failed to save route search inputs:", error);
  }
}

/**
 * Validate route search input state structure
 */
function isValidRouteSearchInputState(
  state: unknown
): state is RouteSearchInputState {
  if (typeof state !== "object" || state === null) {
    return false;
  }

  const obj = state as Record<string, unknown>;

  return (
    typeof obj.originStopId === "string" &&
    typeof obj.destinationStopId === "string" &&
    typeof obj.originStopName === "string" &&
    typeof obj.destinationStopName === "string" &&
    Array.isArray(obj.originCandidateStopIds) &&
    Array.isArray(obj.destinationCandidateStopIds) &&
    typeof obj.timestamp === "number"
  );
}

/**
 * Get route search inputs from sessionStorage if they exist and haven't expired (5 minutes)
 * Returns null if not found or expired
 */
export function getRouteSearchInputs(): RouteSearchInputState | null {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return null;
  }

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const state: RouteSearchInputState = JSON.parse(stored);

    // Validate the structure of stored data
    if (!isValidRouteSearchInputState(state)) {
      console.warn("Invalid route search input state in storage");
      clearRouteSearchInputs();
      return null;
    }

    const now = Date.now();
    const elapsed = now - state.timestamp;

    // Check if data has expired (more than 5 minutes old)
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
 * Clear route search inputs from sessionStorage
 * This is called when data expires or is invalid
 */
export function clearRouteSearchInputs(): void {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear route search inputs:", error);
  }
}
