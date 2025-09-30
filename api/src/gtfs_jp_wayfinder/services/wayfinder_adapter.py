import asyncio
import logging
from typing import Any

import pandas as pd

from gtfs_jp_wayfinder.models import (
    TripInfoList,
)
from gtfs_jp_wayfinder.services import wayfinder as wf_service

_initialized = False

logger = logging.getLogger(__name__)


async def initialize(data_dir: str):
    """Async initialize wrapper that runs the blocking initialization in a thread."""
    global _initialized
    # if already initialized, no-op
    if wf_service.is_ready():
        _initialized = True
        return wf_service

    # run the blocking initialize in a thread
    await asyncio.to_thread(wf_service.initialize, data_dir)
    _initialized = True
    return wf_service


def is_ready() -> bool:
    return wf_service.is_ready()


# Thin pass-throughs for existing functions. Some of these touch numpy datetimes
# so we convert to HH:MM:SS strings when appropriate.
def get_stop_names(stop_id: str):
    return (
        wf_service.get_stop_names(stop_id)
        if hasattr(wf_service, "get_stop_names")
        else wf_service.get_stop_name(stop_id)
    )


def get_stop_lat_lon(stop_id: str):
    return wf_service.get_stop_lat_lon(stop_id)


def get_trips_from_stop(stop_id: str, service_id: str | None = None):
    return wf_service.get_trips_from_stop(stop_id, service_id)


def get_times_from_trips_and_stop_batch(
    trip_ids: list[str],
    stop_id: str,
    trip_id_contains: str | None = None,
    min_arrival_time: str | None = None,
    max_items: int | None = None,
) -> dict:
    """Batch get arrival/departure times for multiple trips at a specific stop.

    Args:
        trip_ids: List of trip IDs to query
        stop_id: The stop ID to get times for
        trip_id_contains: Optional string that trip_id must contain
        min_arrival_time: Optional minimum arrival time filter in "HH:MM:SS" format
                         (returns trips with arrival >= this time)
        max_items: Optional maximum number of results to return. If None, uses
                  environment variable GTFS_BATCH_MAX_ITEMS or returns all results.

    Returns:
        dict mapping trip_id -> {trip_id, arrival_time, departure_time}.
        This is the optimized bulk version that reduces N queries to 1 query.
    """
    if not trip_ids:
        return {}

    # Apply max_items limit, considering environment variable if not explicitly set
    effective_max_items = _get_effective_max_items(max_items)
    if effective_max_items is not None and effective_max_items <= 0:
        return {}  # No items requested

    try:
        # Access underlying wayfinder for bulk DataFrame operation
        wayfinder = getattr(wf_service, "_wf", None)  # type: ignore
        if not wayfinder or not hasattr(wayfinder, "df_stop_times"):
            # Fallback to individual calls if bulk approach fails
            filtered_trip_ids = _filter_trip_ids(trip_ids, trip_id_contains)

            # Apply max_items limit to initial fallback case
            if effective_max_items is not None:
                filtered_trip_ids = filtered_trip_ids[:effective_max_items]

            return {
                trip_id: get_time_from_trip_and_stop_single(trip_id, stop_id)
                for trip_id in filtered_trip_ids
            }

        # Apply trip_id filtering first to reduce dataset size
        filtered_trip_ids = _filter_trip_ids(trip_ids, trip_id_contains)
        if not filtered_trip_ids:
            return {}

        # Single bulk DataFrame query instead of N individual queries
        df = wayfinder.df_stop_times  # type: ignore
        filtered = df[
            (df["trip_id"].isin(filtered_trip_ids)) & (df["stop_id"] == stop_id)
        ][["trip_id", "arrival_time", "departure_time"]]  # type: ignore

        # Convert times and build result mapping
        result = {}
        conv = getattr(wf_service, "format_np_datetime", None)

        # Parse min_arrival_time for comparison if provided
        min_arrival_seconds = None
        if min_arrival_time:
            try:
                min_arrival_seconds = _time_string_to_seconds(min_arrival_time)
            except Exception:
                raise

        for _, row in filtered.iterrows():  # type: ignore
            trip_id = row["trip_id"]  # type: ignore
            arrival_time = row["arrival_time"]  # type: ignore
            departure_time = row["departure_time"]  # type: ignore

            # Apply min_arrival_time filter before processing
            if min_arrival_seconds is not None and arrival_time is not None:
                try:
                    # Convert arrival_time to string first, then to seconds for comparison
                    if conv is not None:
                        arrival_str = conv(arrival_time)
                    else:
                        arrival_str = pd.Timestamp(arrival_time).strftime("%H:%M:%S")

                    arrival_seconds = _time_string_to_seconds(arrival_str)

                    if arrival_seconds < min_arrival_seconds:
                        continue  # Skip this trip as it's too early
                except Exception:
                    # If parsing fails, include the trip (don't filter out due to parsing errors)
                    logger.warning(
                        f"Warning: Could not parse arrival time for trip {trip_id}. Given value: {arrival_time}"
                    )
                    pass

            # Convert times using the same logic as the original function
            converted_arrival = None
            converted_departure = None

            if arrival_time is not None:
                try:
                    if conv is not None:
                        converted_arrival = conv(arrival_time)
                    else:
                        converted_arrival = pd.Timestamp(arrival_time).strftime(
                            "%H:%M:%S"
                        )
                except Exception:
                    try:
                        converted_arrival = str(arrival_time)
                    except Exception:
                        converted_arrival = None

            if departure_time is not None:
                try:
                    if conv is not None:
                        converted_departure = conv(departure_time)
                    else:
                        converted_departure = pd.Timestamp(departure_time).strftime(
                            "%H:%M:%S"
                        )
                except Exception:
                    try:
                        converted_departure = str(departure_time)
                    except Exception:
                        converted_departure = None

            result[trip_id] = {
                "trip_id": trip_id,
                "arrival_time": converted_arrival,
                "departure_time": converted_departure,
            }

            # Apply max_items limit during processing for efficiency
            if effective_max_items is not None and len(result) >= effective_max_items:
                break

        return result

    except Exception:
        # Fallback to individual calls if any error occurs
        filtered_trip_ids = _filter_trip_ids(trip_ids, trip_id_contains)

        # Apply max_items limit to fallback case as well
        if effective_max_items is not None:
            filtered_trip_ids = filtered_trip_ids[:effective_max_items]

        return {
            trip_id: get_time_from_trip_and_stop_single(trip_id, stop_id)
            for trip_id in filtered_trip_ids
        }


def _get_effective_max_items(max_items: int | None) -> int | None:
    """Get the effective max items limit, considering environment variable."""
    import os

    if max_items is not None:
        return max_items

    # Check environment variable
    env_max = os.environ.get("GTFS_BATCH_MAX_ITEMS")
    if env_max:
        try:
            return int(env_max)
        except ValueError:
            logger.warning(
                f"Warning: Invalid GTFS_BATCH_MAX_ITEMS env value: {env_max}"
            )

    return None  # No limit


def _filter_trip_ids(
    trip_ids: list[str], contains_filter: str | None = None
) -> list[str]:
    """Helper function to filter trip IDs by substring."""
    if not contains_filter:
        return trip_ids

    return [trip_id for trip_id in trip_ids if contains_filter in trip_id]


def _time_string_to_seconds(time_str: str) -> int:
    """Convert time string (HH:MM:SS or HH:MM) to seconds since midnight.

    Handles GTFS extended time format where hours can exceed 24 (e.g., 25:30:00 for 1:30 AM next day).

    Args:
        time_str: Time string in HH:MM:SS or HH:MM format

    Returns:
        Total seconds since midnight (can exceed 86400 for next-day times)

    Raises:
        ValueError: If time string format is invalid
    """
    if not time_str:
        raise ValueError("Empty time string")

    parts = time_str.split(":")
    if len(parts) < 2 or len(parts) > 3:
        raise ValueError(f"Invalid time format: {time_str}")

    try:
        hours = int(parts[0])
        minutes = int(parts[1])
        seconds = int(parts[2]) if len(parts) == 3 else 0

        if minutes < 0 or minutes >= 60:
            raise ValueError(f"Invalid minutes: {minutes}")
        if seconds < 0 or seconds >= 60:
            raise ValueError(f"Invalid seconds: {seconds}")

        return hours * 3600 + minutes * 60 + seconds

    except (ValueError, IndexError) as e:
        raise ValueError(f"Could not parse time '{time_str}': {e}") from e


def get_time_from_trip_and_stop_single(trip_id: str, stop_id: str):
    """Original single-trip implementation, used internally and as fallback."""
    res = wf_service.get_time_from_trip_and_stop(trip_id, stop_id)
    # use public formatter when available
    conv = getattr(wf_service, "format_np_datetime", None)

    for k in ("arrival_time", "departure_time"):
        v = res.get(k)
        if v is None:
            continue
        try:
            if conv is not None:
                res[k] = conv(v)
            else:
                res[k] = pd.Timestamp(v).strftime("%H:%M:%S")
        except Exception:
            # best-effort fallback to string() so we don't return raw numpy types
            try:
                res[k] = str(v)
            except Exception:
                res[k] = None
    return res


def get_time_from_trip_and_stop(trip_id: str, stop_id: str):
    """Return dict with trip_id, arrival_time and departure_time.

    Compatibility wrapper that uses the batch function internally for consistency.
    For better performance when dealing with multiple trips, use get_times_from_trips_and_stop_batch directly.
    """
    batch_result = get_times_from_trips_and_stop_batch([trip_id], stop_id)
    return batch_result.get(
        trip_id, {"trip_id": trip_id, "arrival_time": None, "departure_time": None}
    )


def get_filtered_times_from_trips_and_stop(
    trip_ids: list[str],
    stop_id: str,
    trip_id_contains: str | None = None,
    min_arrival_time: str | None = None,
    max_items: int | None = None,
) -> dict:
    """Get times for trips with filtering options.

    This is a convenience wrapper that exposes the filtering capabilities
    of the batch function with a more descriptive name for API usage.

    Args:
        trip_ids: List of trip IDs to query
        stop_id: The stop ID to get times for
        trip_id_contains: Optional string that trip_id must contain
        min_arrival_time: Optional minimum arrival time filter in "HH:MM:SS" format
        max_items: Optional maximum number of results to return

    Returns:
        dict mapping trip_id -> {trip_id, arrival_time, departure_time}
    """
    return get_times_from_trips_and_stop_batch(
        trip_ids, stop_id, trip_id_contains, min_arrival_time, max_items
    )


def get_route_id_from_trip(trip_id: str):
    return wf_service.get_route_id_from_trip(trip_id)


def get_route_name_from_route(route_id: str):
    return wf_service.get_route_name_from_route(route_id)


def get_destination_display_name_from_route(route_id: str):
    return wf_service.get_destination_display_name_from_route(route_id)


def get_destination_id_from_trip(trip_id: str):
    return wf_service.get_destination_id_from_trip(trip_id)


def get_stops_from_trip(trip_id: str) -> list[dict]:
    """Return list of dicts representing timed stops, converting numpy datetime to HH:MM:SS strings.

    Optimized version that reduces the number of individual DataFrame queries by batching
    stop name lookups.
    """
    df = wf_service.get_stops_from_trip(trip_id)

    # Convert to records first
    records = df.to_dict("records")

    # Collect all unique stop_ids from the records for batch processing
    stop_ids_in_trip = []
    seen_stop_ids = set()
    for r in records:
        stop_id = r.get("stop_id")
        if stop_id and stop_id not in seen_stop_ids:
            seen_stop_ids.add(stop_id)
            stop_ids_in_trip.append(stop_id)

    # Batch fetch stop names to avoid N individual DataFrame queries
    stop_name_cache = {}
    if stop_ids_in_trip:
        # Try bulk lookup via direct DataFrame access (much faster than individual calls)
        try:
            # Access the underlying AkitaBusWayFinder instance for direct DataFrame query
            wayfinder = getattr(wf_service, "_wf", None)
            if wayfinder and hasattr(wayfinder, "df_stops"):
                stops_df = wayfinder.df_stops
                # Filter stops DataFrame once for all stop_ids in this trip
                filtered_stops = stops_df[stops_df["stop_id"].isin(stop_ids_in_trip)]

                # Build cache from bulk query result
                for _, row in filtered_stops.iterrows():
                    stop_id = row["stop_id"]
                    stop_name = row["stop_name"]
                    if stop_id not in stop_name_cache:
                        stop_name_cache[stop_id] = []
                    stop_name_cache[stop_id].append(stop_name)
        except Exception:
            # Fallback to individual queries if bulk approach fails
            pass

    # Get datetime conversion function once
    conv = getattr(wf_service, "format_np_datetime", None)

    # Process each record efficiently
    for r in records:
        # Convert datetime fields using the helper function
        if conv is not None:
            for time_field in ("arrival_time", "departure_time"):
                time_value = r.get(time_field)
                if time_value is not None:
                    try:
                        r[time_field] = conv(time_value)
                    except Exception:
                        pass

        # Add stop name using cache or individual lookup as fallback
        stop_id = r.get("stop_id")
        if stop_id:
            if stop_id in stop_name_cache:
                # Use cached result (this is the optimization - avoids repeated DataFrame queries)
                stop_names = stop_name_cache[stop_id]
                r["stop_name"] = (
                    stop_names[0] if stop_names and len(stop_names) > 0 else None
                )
            else:
                # Fallback for stops not found in cache
                try:
                    stop_names = get_stop_names(stop_id)
                    r["stop_name"] = (
                        stop_names[0] if stop_names and len(stop_names) > 0 else None
                    )
                except Exception:
                    r["stop_name"] = None

    return records


async def get_stops_from_trips_parallel(trip_ids: list[str]) -> dict:  # type: ignore
    """Fetch stops data for multiple trips in parallel.

    Returns dict mapping trip_id -> stops_data.
    Uses asyncio to fetch multiple trip stops concurrently for better performance.
    """
    if not trip_ids:
        return {}

    async def fetch_single_trip_stops(trip_id: str):
        """Async wrapper for get_stops_from_trip."""
        try:
            # Run the synchronous function in a thread to avoid blocking
            result = await asyncio.to_thread(get_stops_from_trip, trip_id)
            return trip_id, result
        except Exception:
            # Return trip_id with None on error for graceful degradation
            return trip_id, None

    # Create tasks for parallel execution
    tasks = [fetch_single_trip_stops(trip_id) for trip_id in trip_ids]

    # Execute all tasks concurrently
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Build result dictionary, handling exceptions gracefully
    stops_map = {}
    for result in results:  # type: ignore
        if isinstance(result, Exception):
            # Log exception but don't fail the whole operation
            continue
        elif isinstance(result, tuple) and len(result) == 2:
            trip_id, stops_data = result
            stops_map[trip_id] = stops_data

    return stops_map


def get_fare_by_stops(from_id: str, to_id: str) -> int:
    return wf_service.get_fare_by_stops(from_id, to_id)


def get_trip_info_batch(trip_ids: list[str]) -> TripInfoList:
    return wf_service.get_trip_info_batch(trip_ids)


def get_shortest_path(from_id: str, to_id: str, service_id: str | None = None):
    return wf_service._wf.get_shortest_path(from_id, to_id, service_id)


def get_travels_from_path(path: list, service_id: str | None = None):
    return wf_service._wf.get_travels_from_path(path, service_id)


def get_timed_travels_from_path(
    path: list, service_id: str, begin_time: Any, change_time: Any | None = None
):
    # begin_time is expected to be numpy.datetime64 already by callers; if a string is passed, leave to underlying implementation
    if change_time is None:
        return wf_service._wf.get_timed_travels_from_path(path, service_id, begin_time)
    return wf_service._wf.get_timed_travels_from_path(
        path, service_id, begin_time, change_time
    )


def get_nearby_stops(lat: float, lon: float, limit: int = 10):
    """Get nearby bus stops sorted by distance."""
    return wf_service.get_nearby_stops(lat, lon, limit)


def get_trip_journey(trip_id: str, from_stop_id: str):
    return wf_service._wf.get_trip_journey(trip_id, from_stop_id)


def get_default_date():
    return wf_service.get_default_date()
