import threading
from typing import Dict, List, Optional, Any, Union
import pandas as pd
import numpy as np

from gtfs_jp_wayfinder.database import AkitaBusWayFinder, NearbyStopResult
from gtfs_jp_wayfinder.models import (
    TripInfo,
    TripInfoList,
)

# Singleton instance and lock
_wf: Optional[AkitaBusWayFinder] = None
_wf_lock = threading.Lock()


def initialize(data_dir: str):
    global _wf
    with _wf_lock:
        if _wf is None:
            wf = AkitaBusWayFinder()
            wf.initialize(data_dir)
            _wf = wf
    return _wf


def is_ready() -> bool:
    return _wf is not None


def get_stop_names(stop_id: str):
    if _wf is None:
        raise RuntimeError("Wayfinder not initialized")
    return _wf.get_stop_name(stop_id)


def get_stop_lat_lon(stop_id: str):
    if _wf is None:
        raise RuntimeError("Wayfinder not initialized")
    return _wf.get_stop_lat_lon(stop_id)


def get_trips_from_stop(stop_id: str, service_id: Optional[str] = None):
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
    fare = _wf.get_fare_from_id(fare_id).item()
    return fare


def get_trip_info_batch(trip_ids: List[str]) -> TripInfoList:
    # Batch helper: dedupe route lookups
    trips: List[TripInfo] = []
    route_cache: Dict[str, str] = {}
    dest_cache: Dict[str, str] = {}
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
            )
        )

    return TripInfoList(trips=trips)


def format_np_datetime(value: Union[pd.Timestamp, np.datetime64, str]) -> str:
    """Utility to format numpy.datetime64 or pandas.Timestamp to HH:MM:SS.

    This helper is exposed so adapters can convert underlying numpy/pandas
    datetime types to plain strings for Pydantic models.
    """
    if value is None:
        return ""
    
    # Use pandas Timestamp for consistent formatting
    timestamp = pd.Timestamp(value)
    return timestamp.strftime("%H:%M:%S")


def get_nearby_stops(lat: float, lon: float, limit: int = 10) -> List[NearbyStopResult]:
    """Get nearby bus stops sorted by distance."""
    if _wf is None:
        raise RuntimeError("Wayfinder not initialized")
    return _wf.get_nearby_stops(lat, lon, limit)
