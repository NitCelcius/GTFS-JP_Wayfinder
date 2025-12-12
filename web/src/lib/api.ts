// API client wrapper with error handling and request configuration
import {
  getNearbyStopsStopsNearbyGet,
  getStopStopsStopIdGet,
  getUpcomingStopsStopIdUpcomingGet,
  searchPathPathSearchGet,
  searchStopsStopsGet,
  timedSearchPathTimedSearchGet,
} from "@/api";
import { client as generatedClient } from "@/api/client.gen";

import { getEnvValue } from "./envUtils";

// Configure the generated client to use the correct base URL
const baseUrl = getEnvValue(
  "NEXT_PUBLIC_API_BASE_URL",
  "http://localhost:8002"
);

// Validate API base URL configuration
if (typeof window !== "undefined") {
  const nodeEnv = getEnvValue("NODE_ENV", "development");
  const isProduction = nodeEnv === "production";
  const isLocalhost =
    baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

  // Debug logging to help diagnose configuration issues
  console.group("🔍 API Configuration Debug");
  console.log("Environment:", nodeEnv);
  console.log("API Base URL:", baseUrl);
  console.log("Is localhost?", isLocalhost);
  console.groupEnd();

  if (isProduction && isLocalhost) {
    console.error(
      "\n❌ CRITICAL: API is configured to use localhost in production!\n" +
        `   Current API URL: ${baseUrl}\n` +
        "   \n" +
        "   DIAGNOSIS: NEXT_PUBLIC_API_BASE_URL was not set during the Vercel build.\n" +
        "   \n" +
        "   SOLUTION:\n" +
        "   1. Verify env var is set in Vercel: Settings → Environment Variables\n" +
        "   2. Make sure it's enabled for 'Production' environment\n" +
        "   3. Redeploy from: Deployments → ... → Redeploy\n" +
        "   4. Check build logs for '✅ API Base URL:' message\n"
    );
  } else if (!isProduction) {
    console.info(`🔧 API Base URL: ${baseUrl}`);
  }
}

generatedClient.setConfig({ baseUrl });

export function getCurrentApiBaseUrl(): string {
  return baseUrl;
}

export class ApiClient {
  private static instance: ApiClient;

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  async searchBusStops(name: string, exact: boolean = false) {
    try {
      return await searchStopsStopsGet({
        query: { name, exact },
      });
    } catch (error) {
      console.error("API Error:", error);
      throw new Error("Failed to search bus stops");
    }
  }

  async getBusStopInfo(stopId: string, serviceId?: string) {
    try {
      return await getUpcomingStopsStopIdUpcomingGet({
        path: { stop_id: stopId },
        ...(serviceId && { query: { service_id: serviceId } }),
      });
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(`Failed to fetch bus stop info for ${stopId}`);
    }
  }

  async getBusStopInfoExpanded(
    stopId: string,
    serviceId?: string,
    limit?: number,
    beginTime?: string
  ) {
    try {
      return await getUpcomingStopsStopIdUpcomingGet({
        path: { stop_id: stopId },
        query: {
          expand: "trip_info,stops",
          ...(limit && { limit }),
          ...(serviceId && { service_id: serviceId }),
          ...(beginTime && { begin_time: beginTime }),
        },
      });
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(`Failed to fetch expanded bus stop info for ${stopId}`);
    }
  }

  async getStopNames(stopId: string, fields?: string) {
    try {
      return await getStopStopsStopIdGet({
        path: { stop_id: stopId },
        ...(fields && { query: { _fields: fields } }),
      });
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(`Failed to fetch stop names for ${stopId}`);
    }
  }

  async getStopInfo(stopId: string, includeLocation: boolean = false) {
    // Convenience method that calls getStopNames with location field if requested
    return this.getStopNames(stopId, includeLocation ? "location" : undefined);
  }

  async searchRoutes(fromStop: string, toStop: string, serviceId?: string) {
    try {
      return await searchPathPathSearchGet({
        query: {
          from_stop: fromStop,
          to_stop: toStop,
          ...(serviceId && { service_id: serviceId }),
        },
      });
    } catch (error) {
      console.error("API Error:", error);
      throw new Error("Failed to search routes");
    }
  }

  async getNearbyStops(lat: number, lon: number, limit?: number) {
    try {
      return await getNearbyStopsStopsNearbyGet({
        query: {
          lat,
          lon,
          ...(limit && { limit }),
        },
      });
    } catch (error) {
      console.error("API Error:", error);
      throw new Error("Failed to fetch nearby stops");
    }
  }

  async searchTimedRoutes(
    fromStop: string,
    toStop: string,
    beginTime?: string,
    serviceId?: string
  ) {
    try {
      return await timedSearchPathTimedSearchGet({
        query: {
          from_stop: fromStop,
          to_stop: toStop,
          ...(beginTime && { begin_time: beginTime }),
          ...(serviceId && { service_id: serviceId }),
        },
      });
    } catch (error) {
      console.error("API Error:", error);
      throw new Error("Failed to search timed routes");
    }
  }
}

export const apiClient = ApiClient.getInstance();
