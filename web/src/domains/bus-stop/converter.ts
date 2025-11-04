// Conversion logic for transforming API responses to domain types
import type { EnrichedTripData, NearbyStop, TripTimedStopData } from "./types";
import type { BusInfo, BusStop, JourneyStopData } from "./types";

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
 * Convert a list of EnrichedTripData (buses) to an array of BusInfo
 */
export function convertBusesToBusInfoList(
  buses: EnrichedTripData[]
): BusInfo[] {
  return buses.map(convertTripToBusInfo);
}

/**
 * Select the best bus to display from a list based on current time
 * Strategy 1: If there are future buses, pick the earliest one
 * Strategy 2: If all buses are in the past, pick the most recent one
 *
 * @param buses - The list of upcoming buses to select from
 * @param currentTime - The reference time for selection (if none, the first bus is chosen)
 * @returns The index of the selected bus
 * @throws RangeError if no buses are provided
 * @throws Error if no parseable bus arrival times are found
 */
export function computeBestBusIndex(
  buses: EnrichedTripData[],
  currentTime: Date = new Date(0)
): number {
  if (buses.length === 0)
    throw new RangeError("No buses available to select from");
  if (buses.length === 1) {
    return 0;
  }

  // Single-pass: track earliest future bus and most recent past bus indices
  let earliestFutureIndex: number | null = null;
  let earliestFutureTime: Date | null = null;

  let mostRecentPastIndex: number | null = null;
  let mostRecentPastTime: Date | null = null;

  for (let i = 0; i < buses.length; i++) {
    const b = buses[i];
    let t: Date;
    try {
      t = parseDateTime(b.arrival_datetime);
    } catch {
      console.warn(
        `Failed to parse bus arrival datetime: ${b.arrival_datetime}`
      );
      continue; // skip unparsable times
    }

    if (t >= currentTime) {
      if (earliestFutureTime === null || t < earliestFutureTime) {
        earliestFutureTime = t;
        earliestFutureIndex = i;
      }
    } else {
      if (mostRecentPastTime === null || t > mostRecentPastTime) {
        mostRecentPastTime = t;
        mostRecentPastIndex = i;
      }
    }
  }

  // Prefer earliest future bus when available, otherwise most recent past bus.
  if (earliestFutureIndex !== null) return earliestFutureIndex;
  if (mostRecentPastIndex !== null) return mostRecentPastIndex;

  // Fallback: no parseable times found, cannot compute
  throw new Error("No parseable bus arrival times found");
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
