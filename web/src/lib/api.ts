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

// Configure the generated client to use the correct base URL
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8002";
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
          limit: 1,
          ...(serviceId && { service_id: serviceId }),
          ...(limit && { limit }),
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
