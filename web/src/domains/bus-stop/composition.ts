/**
 * Composition logic for assembling bus stop info with intelligent bus selection.
 * This layer combines converted data with selection strategies.
 */
import {
  computeBestBusIndex,
  convertBusesToBusInfoList,
  convertTripStopsToJourneyStops,
} from "./converter";
import type { BusStopInfo, UpcomingBusEnrichedData } from "./types";

/**
 * Compose BusStopInfo from API data with intelligent default bus selection.
 * Pre-computes all journeys and suggests the best bus index based on current time.
 *
 *
 * @param enrichedData - Raw API response data
 * @param stopName - Stop name
 * @param stopId - Stop ID
 * @param distance - Distance to stop (optional)
 * @param lat - Stop latitude (optional)
 * @param lon - Stop longitude (optional)
 * @param currentTime - Reference time for selecting the best bus
 * @returns BusStopInfo with pre-computed journeys and best bus index suggestion
 */
export function composeBusStopInfoWithLatestSelection(
  enrichedData: UpcomingBusEnrichedData,
  stopName: string,
  stopId: string,
  distance?: string,
  lat?: number,
  lon?: number,
  currentTime: Date | undefined = undefined
): BusStopInfo {
  // Select the best bus index based on current time
  const bestBusIndex = computeBestBusIndex(enrichedData.buses, currentTime);

  // Convert all buses and pre-compute their journeys
  const busesWithJourneys = enrichedData.buses.map((trip) => ({
    busInfo: convertBusesToBusInfoList([trip])[0],
    routeJourney: trip.stops
      ? convertTripStopsToJourneyStops(trip.stops, stopId)
      : [],
  }));

  const result: BusStopInfo = {
    busStop: {
      id: enrichedData.stop_id,
      name: stopName,
      distance,
      lat,
      lon,
    },
    busesWithJourneys,
    bestBusIndex,
  };

  return result;
}
