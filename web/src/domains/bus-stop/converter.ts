// Conversion logic for transforming API responses to domain types
import type {
  EnrichedTripData,
  NearbyStop,
  TripTimedStopData,
  UpcomingBusEnrichedData,
} from "./types";
import type { BusInfo, BusStop, BusStopInfo, JourneyStopData } from "./types";

/**
 * Convert ISO datetime string to Date object
 * @throws Error if datetime string is invalid
 */
function parseDateTime(datetimeString: string): Date {
  const date = new Date(datetimeString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid datetime string: "${datetimeString}"`);
  }
  return date;
}

/**
 * Convert API time string (HH:MM:SS) to display format (HH:MM)
 */
export function formatTime(timeString: string): string {
  return timeString.slice(0, 5); // "13:05:00" -> "13:05"
}

/**
 * Convert EnrichedTripData to BusInfo
 */
export function convertTripToBusInfo(trip: EnrichedTripData): BusInfo {
  // Extract system number from route_name if available
  // const routeName = trip.route_name || "";
  // const systemMatch = routeName.match(/系統(\d+)/);
  // const system = systemMatch ? `系統${systemMatch[1]}` : "";

  let arrivalDatetime: Date;
  try {
    arrivalDatetime = parseDateTime(trip.arrival_datetime);
  } catch (error) {
    throw new Error(
      `Failed to parse arrival datetime in BusInfo: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return {
    line: trip.route_name || "不明",
    system: "", // TODO: APIにない
    destination: trip.destination_display_name || "不明", // TODO: nullableにすべきか
    direction: "行",
    arrivalTime: formatTime(trip.arrival_time),
    arrivalDatetime,
    status: "当バス停着",
  };
}

/**
 * Convert TripTimedStop array to JourneyStopData array
 * The first stop (matching current stop_id) becomes "current",
 * the last becomes "destination", others are "intermediate"
 */
export function convertTripStopsToJourneyStops(
  stops: TripTimedStopData[],
  currentStopId: string
): JourneyStopData[] {
  if (stops.length === 0) return [];

  const journeyStops: JourneyStopData[] = [];
  const currentStopIndex = stops.findIndex(
    (stop) => stop.stop_id === currentStopId
  );

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    let type: JourneyStopData["type"];
    let label: string | undefined;

    if (i === currentStopIndex) {
      type = "current";
      label = "現在地";
    } else if (i === stops.length - 1) {
      type = "destination";
    } else {
      type = "intermediate";
    }

    // TODO: Implement proper fare calculation using fare API endpoint
    const cost = 0;

    let arrivalDatetime: Date;
    let departureDatetime: Date;
    try {
      arrivalDatetime = parseDateTime(stop.arrival_datetime);
    } catch (error) {
      throw new Error(
        `Failed to parse arrival datetime for journey stop "${stop.stop_name}": ${error instanceof Error ? error.message : String(error)}`
      );
    }
    try {
      departureDatetime = parseDateTime(stop.departure_datetime);
    } catch (error) {
      throw new Error(
        `Failed to parse departure datetime for journey stop "${stop.stop_name}": ${error instanceof Error ? error.message : String(error)}`
      );
    }

    journeyStops.push({
      id: stop.stop_id,
      name: stop.stop_name || "不明",
      type,
      time: formatTime(stop.arrival_time), // Backward compatibility
      arrivalTime: formatTime(stop.arrival_time),
      departureTime: formatTime(stop.departure_time),
      arrivalDatetime,
      departureDatetime,
      cost: cost && cost >= 0 ? cost : undefined, // TODO: currently zero due to API being WIP
      label,
    });
  }

  return journeyStops;
}

/**
 * Select the best bus and find its index in the buses array
 * 
 * Selection logic:
 * 1. If there are future buses (after currentTime), pick the earliest one (minimum time)
 * 2. If all buses are in the past (before currentTime), pick the latest one (maximum time)
 *    This allows users to see the bus they just missed
 * 
 * Works correctly regardless of the order buses are returned from the API.
 * Returns the index of the best bus, or -1 if no buses are available
 * 
 * @param buses - List of buses to select from
 * @param currentTime - Current time for comparison (optional). If not provided, assumes all buses are future.
 */
function selectBestBusIndex(
  buses: EnrichedTripData[],
  currentTime?: Date
): number {
  if (buses.length === 0) return -1;
  if (buses.length === 1) return 0;

  let bestIndex = 0;
  let bestTime = parseDateTime(buses[0].arrival_datetime);

  // Parse all bus times
  const busTimes: Date[] = [];
  for (let i = 0; i < buses.length; i++) {
    try {
      busTimes[i] = parseDateTime(buses[i].arrival_datetime);
    } catch {
      console.warn(
        `Failed to parse bus arrival datetime: ${buses[i].arrival_datetime}`
      );
      busTimes[i] = new Date(0); // Use epoch as fallback (will be treated as very old)
    }
  }

  // Check if there are any future buses
  const hasFutureBuses =
    currentTime && busTimes.some((time) => time > currentTime);

  if (hasFutureBuses) {
    // Strategy 1: Pick the earliest future bus (minimum time among future buses)
    bestIndex = 0;
    bestTime = busTimes[0];

    for (let i = 1; i < busTimes.length; i++) {
      // Find the earliest bus that is still in the future
      if (busTimes[i] > currentTime! && busTimes[i] < bestTime) {
        bestIndex = i;
        bestTime = busTimes[i];
      }
    }

    // If the best bus we found is in the past, find the earliest future bus
    if (bestTime <= currentTime!) {
      for (let i = 0; i < busTimes.length; i++) {
        if (busTimes[i] > currentTime!) {
          if (i === 0 || busTimes[i] < bestTime) {
            bestIndex = i;
            bestTime = busTimes[i];
          }
        }
      }
    }
  } else {
    // Strategy 2: All buses are in the past, pick the latest one (maximum time)
    // This shows the user the most recent bus they could have taken
    bestIndex = 0;
    bestTime = busTimes[0];

    for (let i = 1; i < busTimes.length; i++) {
      if (busTimes[i] > bestTime) {
        bestIndex = i;
        bestTime = busTimes[i];
      }
    }
  }

  return bestIndex;
}

/**
 * Convert UpcomingBusEnrichedData to BusStopInfo
 * @param currentTime - Optional current time for intelligent bus selection (if provided, can pick past buses if all have passed)
 */
export function convertUpcomingBusToBusStopInfo(
  data: UpcomingBusEnrichedData,
  stopName: string,
  distance?: string,
  lat?: number,
  lon?: number,
  currentTime?: Date
): BusStopInfo {
  const busStop: BusStop = {
    id: data.stop_id,
    name: stopName,
    distance,
    lat,
    lon,
  };

  // Convert all buses to BusInfo
  const buses: BusInfo[] = data.buses.map(convertTripToBusInfo);

  // Find the index of the best bus to display, passing current time for intelligent selection
  const currentBusIndex = selectBestBusIndex(
    data.buses,
    currentTime || new Date()
  );
  const nextBus = currentBusIndex >= 0 ? buses[currentBusIndex] : undefined;

  // Convert trip stops to journey stops if available
  const nextBusTrip =
    currentBusIndex >= 0 ? data.buses[currentBusIndex] : undefined;
  const routeJourney: JourneyStopData[] = nextBusTrip?.stops
    ? convertTripStopsToJourneyStops(nextBusTrip.stops, data.stop_id)
    : [];

  return {
    busStop,
    buses,
    busTrips: data.buses,
    currentBusIndex,
    nextBus,
    routeJourney,
  };
}

/**
 * TODO: Implement geolocation-based distance calculation
 * Currently returns mock distance value
 */
export function calculateDistance(): string {
  return "";
}

/**
 * Convert NearbyStop from API to BusStop domain type
 */
export function convertNearbyStopToBusStop(nearbyStop: NearbyStop): BusStop {
  return {
    id: nearbyStop.stop_id,
    name: nearbyStop.stop_name,
    distance: formatDistance(nearbyStop.distance_km),
  };
}

/**
 * Format distance in km to a user-friendly string
 */
function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}
