/**
 * Server-side API client for use in Server Components (Next.js App Router)
 * This file does NOT have "use client" directive and can be used in SSR
 */

import {
  getBusStopInfoStopsStopIdGet,
  getUpcomingStopsStopIdUpcomingGet,
} from "@/api";
import { createClient } from "@/api/client";
import { getEnvValue } from "./envUtils";

/**
 * Get the API base URL for server-side requests
 */
function getServerApiBaseUrl(): string {
  // In server context, we can use getEnvValue which handles process.env safely
  const baseUrl = getEnvValue("NEXT_PUBLIC_API_BASE_URL");
  if (!baseUrl) {
    throw new Error("[ApiServer] NEXT_PUBLIC_API_BASE_URL is not configured");
  }
  return baseUrl;
}

/**
 * Server-side API client for fetching bus stop data
 */
export class ApiServer {
  private client;

  constructor() {
    const baseUrl = getServerApiBaseUrl();
    this.client = createClient({ baseUrl });
  }

  /**
   * Fetch expanded bus stop info with upcoming buses
   */
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
          include_ending: false,
          ...(limit && { limit }),
          ...(serviceId && { service_id: serviceId }),
          ...(beginTime && { begin_time: beginTime }),
        },
        client: this.client,
      });
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(`Failed to fetch expanded bus stop info for ${stopId}`);
    }
  }

  /**
   * Fetch stop info (name, platform_code, location)
   */
  async getStopInfo(stopId: string, includeLocation: boolean = false) {
    try {
      return await getBusStopInfoStopsStopIdGet({
        path: { stop_id: stopId },
        ...(includeLocation && { query: { _fields: "location" } }),
        client: this.client,
      });
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(`Failed to fetch stop info for ${stopId}`);
    }
  }
}

/**
 * Create a new server-side API client instance
 */
export function createServerApiClient(): ApiServer {
  return new ApiServer();
}
