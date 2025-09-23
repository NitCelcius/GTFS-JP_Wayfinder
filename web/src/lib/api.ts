// API client wrapper with error handling and request configuration
import {
  getUpcomingStopsStopIdUpcomingGet,
  searchPathPathSearchGet,
  searchStopsStopsGet,
} from "@/api";

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
}

export const apiClient = ApiClient.getInstance();
