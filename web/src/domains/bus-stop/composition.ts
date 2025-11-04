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
 * Converts all buses and pre-selects the "best" (earliest upcoming if available, otherwise most recent past) bus based on current time.
 *
 * Use this when you want the hook/logic layer to handle bus selection.
 * The component can still override the selection by updating currentBusIndex.
 *
 * @param enrichedData - Raw API response data
 * @param stopName - Stop name
 * @param stopId - Stop ID
 * @param distance - Distance to stop (optional)
 * @param lat - Stop latitude (optional)
 * @param lon - Stop longitude (optional)
 * @param currentTime - Reference time for selecting the best bus (if undefined, let computeBestBusIndex decide)
 * @returns BusStopInfo with pre-selected currentBusIndex and nextBus
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
  // Select the best bus to display based on current time (returns index or -1)
  const selectedBusIndex = computeBestBusIndex(enrichedData.buses, currentTime);

  const tripBusList = convertBusesToBusInfoList(enrichedData.buses);
  const selectedTripBus = tripBusList[selectedBusIndex];

  // Convert trip stops to journey stops if available
  const routeJourney = enrichedData.buses[selectedBusIndex]?.stops
    ? convertTripStopsToJourneyStops(
        enrichedData.buses[selectedBusIndex].stops,
        stopId
      )
    : [];

  const result: BusStopInfo = {
    busStop: {
      id: enrichedData.stop_id,
      name: stopName,
      distance,
      lat,
      lon,
    },
    buses: tripBusList,
    busTrips: enrichedData.buses,
    currentBusIndex: selectedBusIndex,
    nextBus: selectedTripBus,
    routeJourney,
  };

  return result;
}

/**
 * Compose BusStopInfo from API data with initial selection at first bus.
 * Converts all buses and defaults to displaying the first one.
 *
 * Use this when you want the component to own the bus selection logic.
 * The component receives all buses and can manage currentBusIndex freely.
 *
 * @param data - Raw API response data
 * @param stopName - Stop name
 * @param stopId - Stop ID
 * @param distance - Distance to stop (optional)
 * @param lat - Stop latitude (optional)
 * @param lon - Stop longitude (optional)
 * @returns BusStopInfo with currentBusIndex set to 0 (first bus)
 */
export function composeBusStopInfoWithFirstBus(
  data: UpcomingBusEnrichedData,
  stopName: string,
  stopId: string,
  distance?: string,
  lat?: number,
  lon?: number
): BusStopInfo {
  // Convert all buses to BusInfo
  const buses = convertBusesToBusInfoList(data.buses);

  // Start with first bus, let component decide selection
  const currentBusIndex = buses.length > 0 ? 0 : -1;
  const nextBus = currentBusIndex >= 0 ? buses[0] : undefined;

  // Convert trip stops for the first bus
  const routeJourney =
    currentBusIndex >= 0 && data.buses[0]?.stops
      ? convertTripStopsToJourneyStops(data.buses[0].stops, stopId)
      : [];

  const result: BusStopInfo = {
    busStop: {
      id: data.stop_id,
      name: stopName,
      distance,
      lat,
      lon,
    },
    buses,
    busTrips: data.buses,
    currentBusIndex,
    nextBus,
    routeJourney,
  };

  return result;
}
