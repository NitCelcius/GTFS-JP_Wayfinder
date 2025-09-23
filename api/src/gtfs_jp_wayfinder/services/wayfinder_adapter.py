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
    """Return list of dicts representing timed stops, converting numpy datetime to HH:MM:SS strings."""
    df = wf_service.get_stops_from_trip(trip_id)
    records = df.to_dict("records")
    # try to convert datetimes using public helper
    conv = getattr(wf_service, "format_np_datetime", None)
    for r in records:
        if conv is not None and r.get("arrival_time") is not None:
            try:
                r["arrival_time"] = conv(r["arrival_time"])
            except Exception:
                pass
        if conv is not None and r.get("departure_time") is not None:
            try:
                r["departure_time"] = conv(r["departure_time"])
            except Exception:
                pass
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
