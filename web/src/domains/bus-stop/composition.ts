/**
 * Composition logic for assembling bus stop info with intelligent bus selection.
 * This layer combines converted data with selection strategies.
 */
import {
  computeBestBusIndex,
  convertTripStopsToJourneyStops,
  convertTripToBusInfo,
} from "./converter";
import type { BusStopInfo, UpcomingBusEnrichedData } from "./types";

interface ComposeOptions {
  platformCode?: string | null;
  distance?: string;
  lat?: number;
  lon?: number;
  currentTime?: Date;
}

/**
 * Compose BusStopInfo from API data with intelligent default bus selection.
 * Pre-computes all journeys and suggests the best bus index based on current time.
 *
 *
 * @param enrichedData - Raw API response data
 * @param stopName - Stop name
 * @param stopId - Stop ID
 * @param options - Optional fields: platformCode, distance, lat/lon, currentTime
 * @returns BusStopInfo with pre-computed journeys and best bus index suggestion
 */
export function composeBusStopInfoWithLatestSelection(
  enrichedData: UpcomingBusEnrichedData,
  stopName: string,
  stopId: string,
  options: ComposeOptions = {}
): BusStopInfo {
  const { platformCode, distance, lat, lon, currentTime } = options;

  // Early return for empty buses array to avoid unnecessary processing
  if (enrichedData.buses.length === 0) {
    return {
      busStop: {
        id: enrichedData.stop_id,
        name: stopName,
        platformCode,
        distance,
        lat,
        lon,
      },
      busesWithJourneys: [],
      bestBusIndex: 0,
    };
  }

  // Convert all buses and pre-compute their journeys
  const busesWithJourneys = enrichedData.buses.map((trip) => ({
    busInfo: convertTripToBusInfo(trip),
    routeJourney: trip.stops
      ? convertTripStopsToJourneyStops(trip.stops, stopId)
      : [],
  }));

  // Select the best bus index based on current time
  const bestBusIndex = computeBestBusIndex(enrichedData.buses, currentTime);

  const result: BusStopInfo = {
    busStop: {
      id: enrichedData.stop_id,
      name: stopName,
      platformCode,
      distance,
      lat,
      lon,
    },
    busesWithJourneys,
    bestBusIndex,
  };

  return result;
}
