"use client";

import {
  getBusStopInfoStopsStopIdGet,
  getNearbyStopsStopsNearbyGet,
  getSameNameStopsStopsStopIdPlatformsGet,
  getTripTripsTripIdGet,
  getUpcomingStopsStopIdUpcomingGet,
  searchPathPathSearchGet,
  searchStopsStopsGet,
  timedSearchPathTimedSearchGet,
  tripPassingTripsTripIdPassingGet,
  tripStopsTripsTripIdStopsGet,
} from "@/api";
import { createClient } from "@/api/client";
import type { Client } from "@/api/client";

import { getEnvValue } from "./envUtils";

export class ApiClient {
  private static instance: ApiClient;
  private generatedClient: Client;

  private constructor() {
    // Configure client with baseUrl from environment at runtime
    const baseUrl = getEnvValue("NEXT_PUBLIC_API_BASE_URL");
    if (!baseUrl) {
      throw new Error("[ApiClient] NEXT_PUBLIC_API_BASE_URL is not configured");
    }
    this.generatedClient = createClient({ baseUrl });
    console.debug("[ApiClient] initialized with baseUrl:", baseUrl);
  }

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
        client: this.generatedClient,
      });
    } catch (error) {
      console.error("API Error:", error);
      throw new Error("Failed to search bus stops");
    }
  }

  async getBusStopInfo(
    stopId: string,
    serviceId?: string,
    signal?: AbortSignal
  ) {
    try {
      return await getUpcomingStopsStopIdUpcomingGet({
        path: { stop_id: stopId },
        ...(serviceId && { query: { service_id: serviceId } }),
        ...(signal && { request: { signal } }),
        client: this.generatedClient,
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
    beginTime?: string,
    signal?: AbortSignal
  ) {
    try {
      return await getUpcomingStopsStopIdUpcomingGet({
        path: { stop_id: stopId },
        query: {
          expand: "trip_info,stops",
          include_ending: true,
          ...(limit && { limit }),
          ...(serviceId && { service_id: serviceId }),
          ...(beginTime && { begin_time: beginTime }),
        },
        ...(signal && { request: { signal } }),
        client: this.generatedClient,
      });
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(`Failed to fetch expanded bus stop info for ${stopId}`);
    }
  }

  async getStopNames(stopId: string, fields?: string, signal?: AbortSignal) {
    try {
      return await getBusStopInfoStopsStopIdGet({
        path: { stop_id: stopId },
        ...(fields && { query: { _fields: fields } }),
        ...(signal && { request: { signal } }),
        client: this.generatedClient,
      });
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(`Failed to fetch stop names for ${stopId}`);
    }
  }

  async getStopInfo(
    stopId: string,
    includeLocation: boolean = false,
    signal?: AbortSignal
  ) {
    // Convenience method that calls getStopNames with location field if requested
    return this.getStopNames(
      stopId,
      includeLocation ? "location" : undefined,
      signal
    );
  }

  async searchRoutes(fromStop: string, toStop: string, serviceId?: string) {
    try {
      return await searchPathPathSearchGet({
        query: {
          from_stop: fromStop,
          to_stop: toStop,
          ...(serviceId && { service_id: serviceId }),
        },
        client: this.generatedClient,
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
        client: this.generatedClient,
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
        client: this.generatedClient,
      });
    } catch (error) {
      console.error("API Error:", error);
      throw new Error("Failed to search timed routes");
    }
  }

  async getTripInfo(tripId: string, signal?: AbortSignal) {
    try {
      return await getTripTripsTripIdGet({
        path: { trip_id: tripId },
        ...(signal && { request: { signal } }),
        client: this.generatedClient,
      });
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(`Failed to fetch trip info for ${tripId}`);
    }
  }

  async getTripStops(
    tripId: string,
    fromStopId?: string,
    signal?: AbortSignal
  ) {
    try {
      return await tripStopsTripsTripIdStopsGet({
        path: { trip_id: tripId },
        query: {
          ...(fromStopId && { from_stop_id: fromStopId }),
        },
        ...(signal && { request: { signal } }),
        client: this.generatedClient,
      });
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(`Failed to fetch trip stops for ${tripId}`);
    }
  }

  async getTripPassing(tripId: string, stopId: string, signal?: AbortSignal) {
    try {
      return await tripPassingTripsTripIdPassingGet({
        path: { trip_id: tripId },
        query: { stop_id: stopId },
        ...(signal && { request: { signal } }),
        client: this.generatedClient,
      });
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(
        `Failed to fetch passing info for trip ${tripId} at stop ${stopId}`
      );
    }
  }

  /**
   * Get all stops with the same name as the given stop_id.
   * Used for platform switching (のりば切替) functionality.
   */
  async getSameNameStops(stopId: string, signal?: AbortSignal) {
    try {
      return await getSameNameStopsStopsStopIdPlatformsGet({
        path: { stop_id: stopId },
        ...(signal && { request: { signal } }),
        client: this.generatedClient,
      });
    } catch (error) {
      console.error("API Error:", error);
      throw new Error(
        `Failed to fetch same-name stops (platforms) for ${stopId}`
      );
    }
  }
}

export const apiClient = ApiClient.getInstance();
