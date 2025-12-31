import threading

import numpy as np
import pandas as pd

from gtfs_jp_wayfinder.database import AkitaBusWayFinder, NearbyStopResult
from gtfs_jp_wayfinder.models import (
    TripInfo,
    TripInfoList,
)

# Singleton instance and lock
_wf: AkitaBusWayFinder | None = None
_wf_lock = threading.Lock()


def initialize(data_dir: str, use_cache_graph: bool = False):
    """Initialize the singleton AkitaBusWayFinder instance.

    Args:
        data_dir: Directory path containing GTFS data files.
        use_cache_graph: If True, use cached graph data if available and valid.
                        If False (default), always generate graphs from scratch.

    Returns:
        The initialized AkitaBusWayFinder instance.
    """
    global _wf
    with _wf_lock:
        if _wf is None:
            wf = AkitaBusWayFinder()
            wf.initialize(data_dir, use_cache_graph=use_cache_graph)
            _wf = wf
    return _wf


def is_ready() -> bool:
    return _wf is not None


def get_stop_names(stop_id: str):
    if _wf is None:
        raise RuntimeError("Wayfinder not initialized")
    return _wf.get_stop_name(stop_id)


def get_platform_code(stop_id: str):
    if _wf is None:
        raise RuntimeError("Wayfinder not initialized")
    return _wf.get_platform_code(stop_id)


def get_stop_lat_lon(stop_id: str):
    if _wf is None:
        raise RuntimeError("Wayfinder not initialized")
    return _wf.get_stop_lat_lon(stop_id)


def get_trips_from_stop(stop_id: str, service_id: str | None = None):
    if _wf is None:
        raise RuntimeError("Wayfinder not initialized")
    return _wf.get_trips_from_stop(stop_id, service_id)


def get_time_from_trip_and_stop(trip_id: str, stop_id: str):
    if _wf is None:
        raise RuntimeError("Wayfinder not initialized")
    return _wf.get_time_from_trip_and_stop(trip_id, stop_id)


def get_route_id_from_trip(trip_id: str):
    if _wf is None:
        raise RuntimeError("Wayfinder not initialized")
    return _wf.get_route_id_from_trip(trip_id)


def get_route_name_from_route(route_id: str):
    if _wf is None:
        raise RuntimeError("Wayfinder not initialized")
    return _wf.get_route_name_from_route(route_id)


def get_destination_display_name_from_route(route_id: str):
    if _wf is None:
        raise RuntimeError("Wayfinder not initialized")
    return _wf.get_destination_display_name_from_route(route_id)


def get_destination_id_from_trip(trip_id: str):
    if _wf is None:
        raise RuntimeError("Wayfinder not initialized")
    return _wf.get_destination_id_from_trip(trip_id)


def get_stops_from_trip(trip_id: str):
    if _wf is None:
        raise RuntimeError("Wayfinder not initialized")
    return _wf.get_stops_from_trip(trip_id)


def get_fare_by_stops(from_id: str, to_id: str):
    if _wf is None:
        raise RuntimeError("Wayfinder not initialized")
    fare_id = _wf.get_fare_route_by_stops(from_id, to_id)["fare_id"].values[0]
    return _wf.get_fare_from_id(fare_id).item()


def get_trip_info_batch(trip_ids: list[str]) -> TripInfoList:
    # Batch helper: dedupe route lookups
    trips: list[TripInfo] = []
    route_cache: dict[str, str] = {}
    dest_cache: dict[str, str] = {}
    for tid in trip_ids:
        route_name = None
        dest_name = None
        dest_stop = None
        try:
            route_id = get_route_id_from_trip(tid)
            if route_id in route_cache:
                route_name = route_cache[route_id]
            else:
                try:
                    rn = get_route_name_from_route(route_id)
                    route_cache[route_id] = rn
                    route_name = rn
                except Exception:
                    route_name = None
            if route_id in dest_cache:
                dest_name = dest_cache[route_id]
            else:
                try:
                    dn = get_destination_display_name_from_route(route_id)
                    dest_cache[route_id] = dn
                    dest_name = dn
                except Exception:
                    dest_name = None
        except Exception:
            # missing trip or other issue; leave fields None
            pass
        try:
            dest_stop = get_destination_id_from_trip(tid)
        except Exception:
            dest_stop = None

        trips.append(
            TripInfo(
                trip_id=tid,
                route_name=route_name,
                destination_display_name=dest_name,
                destination_stop_id=dest_stop,
            ),
        )

    return TripInfoList(trips=trips)


def format_np_datetime(value: pd.Timestamp | np.datetime64 | str) -> str:
    """Utility to format numpy.datetime64 or pandas.Timestamp to HH:MM:SS.

    This helper is exposed so adapters can convert underlying numpy/pandas
    datetime types to plain strings for Pydantic models.

    GTFS-JP extended hours (24+):
    - GTFS-JP allows times >= 24:00:00 to represent services past midnight
      that are part of the previous day's schedule (e.g., 25:30:00 = 1:30 AM next day)
    - When times like "24:05:00" are converted to numpy datetime64, they become
      "2021-01-02T00:05:00" (normalized by numpy to the next day)
    - This function detects such cases by comparing against the default date
      (2021-01-01) and adds 24 hours per day offset to preserve extended hours
    """
    # Use pandas Timestamp for consistent formatting
    timestamp = pd.Timestamp(value)

    # Default date used by the GTFS loader for time-only representations
    default_date = pd.Timestamp("2021-01-01")

    # Calculate day offset from default date
    # If timestamp is on a later date, it means the original time was >= 24:00
    day_offset = (timestamp.date() - default_date.date()).days

    # Calculate total hours including any day offset (for times >= 24:00)
    total_hours = timestamp.hour + (day_offset * 24)

    # Format with extended hours if applicable
    return f"{total_hours:02d}:{timestamp.minute:02d}:{timestamp.second:02d}"


def get_nearby_stops(lat: float, lon: float, limit: int = 10) -> list[NearbyStopResult]:
    """Get nearby bus stops sorted by distance."""
    if _wf is None:
        raise RuntimeError("Wayfinder not initialized")
    return _wf.get_nearby_stops(lat, lon, limit)


def get_default_date() -> str:
    """Get the default date used by the wayfinder."""
    if _wf is None:
        raise RuntimeError("Wayfinder not initialized")
    return _wf.default_date


def get_agency_timezone() -> str:
    """Get the agency timezone (IANA name) loaded from agency.txt."""
    if _wf is None:
        raise RuntimeError("Wayfinder not initialized")
    return _wf.agency_timezone
