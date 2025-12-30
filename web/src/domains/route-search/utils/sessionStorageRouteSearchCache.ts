import type { RouteSearchResult } from "@/types";

/**
 * Validates a RouteSearchResult object to ensure it has the required structure.
 * Simplified validation to prevent basic tampering of sessionStorage data.
 */
function isValidRouteSearchResult(data: unknown): data is RouteSearchResult {
  if (!data || typeof data !== "object") {
    return false;
  }

  const result = data as Record<string, unknown>;

  return (
    Array.isArray(result.travels) &&
    result.travels.length > 0 &&
    typeof result.originStopName === "string" &&
    typeof result.destinationStopName === "string"
  );
}

/**
 * Creates a cache key for route search results
 */
function createCacheKey(fromStop: string, toStop: string): string {
  return `routeSearch:${fromStop}:${toStop}`;
}

/**
 * Stores route search result in sessionStorage
 */
export function cacheRouteSearchResult(
  result: RouteSearchResult,
  fromStop: string,
  toStop: string
): void {
  try {
    const cacheKey = createCacheKey(fromStop, toStop);
    const cacheData = {
      result,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.warn("Failed to cache route search result:", error);
  }
}

/**
 * Retrieves cached route search result from sessionStorage
 * @param maxAgeMs - Maximum age of cache in milliseconds (default: 5 minutes)
 */
export function getCachedRouteSearchResult(
  fromStop: string,
  toStop: string,
  maxAgeMs: number = 5 * 60 * 1000
): RouteSearchResult | null {
  try {
    const cacheKey = createCacheKey(fromStop, toStop);
    const cached = sessionStorage.getItem(cacheKey);

    if (!cached) {
      return null;
    }

    const parsedCache = JSON.parse(cached);

    // Basic validation
    if (
      !parsedCache ||
      typeof parsedCache.timestamp !== "number" ||
      !isValidRouteSearchResult(parsedCache.result)
    ) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }

    // Check if cache is expired
    const ageMs = Date.now() - parsedCache.timestamp;
    if (ageMs > maxAgeMs) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }

    return parsedCache.result;
  } catch (error) {
    console.warn("Failed to retrieve cached route search result:", error);
    return null;
  }
}

/**
 * Clears cached route search result
 */
export function clearRouteCacheResult(fromStop: string, toStop: string): void {
  try {
    const cacheKey = createCacheKey(fromStop, toStop);
    sessionStorage.removeItem(cacheKey);
  } catch (error) {
    console.warn("Failed to clear cached route search result:", error);
  }
}
