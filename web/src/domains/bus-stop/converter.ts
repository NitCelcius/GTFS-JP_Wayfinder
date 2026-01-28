// Conversion logic for transforming API responses to domain types
import { extractRouteNumber } from "@/lib/routeNumber";
import { trimTimeSeconds } from "@/lib/utils";

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
 * Calculate minutes until a given arrival datetime from now
 * @param arrivalDatetimeString - ISO datetime string from API (e.g., "2021-01-01T12:53:00")
 * @param currentTime - Optional current time reference (defaults to now)
 * @returns Number of minutes until arrival (negative for past times)
 * @throws Error if datetime string is invalid
 */
export function calculateMinutesUntilArrival(
  arrivalDatetimeString: string,
  currentTime?: Date
): number {
  const arrivalDatetime = parseDateTime(arrivalDatetimeString);
  const now = currentTime || new Date();
  const diffMs = arrivalDatetime.getTime() - now.getTime();
  return Math.round(diffMs / 60000);
}

/**
 * Convert API time string (HH:MM:SS) to display format (HH:MM)
 * @deprecated Use trimTimeSeconds from @/lib/utils instead
 */
export const formatTime = trimTimeSeconds;

/**
 * Convert EnrichedTripData to BusInfo
 *
 * @see {@link extractRouteNumber} for extraction logic details
 */
export function convertTripToBusInfo(trip: EnrichedTripData): BusInfo {
  // Extract route number
  // Note: trip.route_name can be null from API, filter it out explicitly
  const routeNumber = extractRouteNumber({
    trip_id: trip.trip_id,
    route_short_name: trip.route_name ?? undefined,
    // route_id and service_id not available in EnrichedTripData
  });

  let arrivalDatetime: Date;
  try {
    arrivalDatetime = parseDateTime(trip.arrival_datetime);
  } catch (error) {
    throw new Error(
      `Failed to parse arrival datetime in BusInfo: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return {
    tripId: trip.trip_id,
    line: routeNumber,
    system: "", // TODO: APIにない
    destination: trip.destination_display_name || "不明", // TODO: nullableにすべきか
    direction: "行",
    arrivalTime: formatTime(trip.arrival_time),
    arrivalDatetime,
    status: "当バス停着",
    // Use route_id for color generation (precise unique identifier per route)
    // Falls back to route_name if route_id is not available
    routeColorText: trip.route_id ?? trip.route_name ?? undefined,
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
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 First latitude
 * @param lon1 First longitude
 * @param lat2 Second latitude
 * @param lon2 Second longitude
 * @returns Distance in kilometers
 */
export function calculateDistanceBetweenCoords(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate distance between user's current location and a bus stop
 *
 * @param stopLat - Latitude of the bus stop
 * @param stopLon - Longitude of the bus stop
 * @param userLat - User's current latitude
 * @param userLon - User's current longitude
 * @returns Formatted distance string (e.g., "120m", "1.5km")
 * @throws Error if any required parameter is missing or coordinates are invalid
 * @deprecated Use calculateDistanceBetweenCoords with formatDistance instead
 */
export function calculateDistance(
  stopLat: number,
  stopLon: number,
  userLat: number,
  userLon: number
): string {
  // Validate coordinates are in valid ranges
  if (
    !isFinite(userLat) ||
    !isFinite(userLon) ||
    !isFinite(stopLat) ||
    !isFinite(stopLon) ||
    userLat < -90 ||
    userLat > 90 ||
    userLon < -180 ||
    userLon > 180 ||
    stopLat < -90 ||
    stopLat > 90 ||
    stopLon < -180 ||
    stopLon > 180
  ) {
    throw new Error(
      `Invalid coordinates: user(${userLat}, ${userLon}), stop(${stopLat}, ${stopLon})`
    );
  }

  // Use the consolidated function and convert km to meters for formatting
  const distanceKm = calculateDistanceBetweenCoords(
    userLat,
    userLon,
    stopLat,
    stopLon
  );
  const distanceMeters = distanceKm * 1000;

  // Format distance
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)}m`;
  }
  return `${(distanceMeters / 1000).toFixed(1)}km`;
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
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}
