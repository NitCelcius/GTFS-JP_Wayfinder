import asyncio
from typing import Any, List, Optional

import pandas as pd

from gtfs_jp_wayfinder.models import (
    TripInfoList,
)
from gtfs_jp_wayfinder.services import wayfinder as wf_service

_initialized = False


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


def get_trips_from_stop(stop_id: str, service_id: Optional[str] = None):
    return wf_service.get_trips_from_stop(stop_id, service_id)


def get_time_from_trip_and_stop(trip_id: str, stop_id: str):
    """Return dict with trip_id, arrival_time and departure_time.

    Underlying implementation may return numpy.datetime64 / pandas.Timestamp
    values; convert them to HH:MM:SS strings so Pydantic models expecting
    strings can validate correctly.
    """
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


def get_route_id_from_trip(trip_id: str):
    return wf_service.get_route_id_from_trip(trip_id)


def get_route_name_from_route(route_id: str):
    return wf_service.get_route_name_from_route(route_id)


def get_destination_display_name_from_route(route_id: str):
    return wf_service.get_destination_display_name_from_route(route_id)


def get_destination_id_from_trip(trip_id: str):
    return wf_service.get_destination_id_from_trip(trip_id)


def get_stops_from_trip(trip_id: str) -> List[dict]:
    """Return list of dicts representing timed stops, converting numpy datetime to HH:MM:SS strings.

    Optimized version that reduces the number of individual DataFrame queries by batching
    stop name lookups.
    """
    df = wf_service.get_stops_from_trip(trip_id)

    # Convert to records first
    records = df.to_dict("records")

    # Collect all unique stop_ids from the records for batch processing
    stop_ids_in_trip = []
    for r in records:
        stop_id = r.get("stop_id")
        if stop_id and stop_id not in stop_ids_in_trip:
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


def get_fare_by_stops(from_id: str, to_id: str) -> int:
    return wf_service.get_fare_by_stops(from_id, to_id)


def get_trip_info_batch(trip_ids: List[str]) -> TripInfoList:
    return wf_service.get_trip_info_batch(trip_ids)


def get_shortest_path(from_id: str, to_id: str, service_id: Optional[str] = None):
    return wf_service._wf.get_shortest_path(from_id, to_id, service_id)


def get_travels_from_path(path: list, service_id: Optional[str] = None):
    return wf_service._wf.get_travels_from_path(path, service_id)


def get_timed_travels_from_path(
    path: list, service_id: str, begin_time: Any, change_time: Optional[Any] = None
):
    # begin_time is expected to be numpy.datetime64 already by callers; if a string is passed, leave to underlying implementation
    if change_time is None:
        return wf_service._wf.get_timed_travels_from_path(path, service_id, begin_time)
    return wf_service._wf.get_timed_travels_from_path(
        path, service_id, begin_time, change_time
    )
