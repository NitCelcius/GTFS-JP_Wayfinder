from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from gtfs_jp_wayfinder import models
from gtfs_jp_wayfinder.services import wayfinder_adapter as adapter

router = APIRouter()


def _np_datetime_to_time_str(np_datetime) -> str | None:
    """Convert numpy.datetime64 to HH:MM:SS string format.

    Returns None if the input is None or conversion fails.
    """
    if np_datetime is None:
        return None

    try:
        # Convert numpy datetime64 to string and extract time part
        dt_str = str(np_datetime)
        if "T" in dt_str:
            time_part = dt_str.split("T")[1]
        elif " " in dt_str:
            time_part = dt_str.split(" ")[1]
        else:
            time_part = dt_str

        # Remove microseconds/nanoseconds if present
        if "." in time_part:
            time_part = time_part.split(".")[0]

        return time_part
    except Exception:
        return None


@router.get(
    "/search",
    response_model=models.PathResponse,
    summary="経路検索",
    description="出発停留所から到着停留所への最短経路（停留所ID配列）を返します。",
)
async def search_path(
    from_stop: str = Query(..., description="出発停留所ID"),
    to_stop: str = Query(..., description="到着停留所ID"),
    service_id: Optional[str] = Query(None, description="サービスIDで絞り込み"),
):
    try:
        path = adapter.get_shortest_path(from_stop, to_stop, service_id)
        return models.PathResponse(path=path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/timed_search",
    response_model=models.TimedTravelResponse,
    summary="時刻考慮経路検索",
    description="開始時刻に基づいた時刻付き経路検索を行い、travels を返します。",
)
async def timed_search(
    from_stop: str = Query(..., description="出発停留所ID"),
    to_stop: str = Query(..., description="到着停留所ID"),
    service_id: Optional[str] = Query(None, description="サービスID"),
    begin_time: Optional[str] = Query(None, description="開始時刻 (HH:MM:SS)"),
):
    try:
        path = adapter.get_shortest_path(from_stop, to_stop, service_id)
        # adapter expects begin_time as numpy.datetime64 or compatible; pass through
        if isinstance(begin_time, str):
            from pandas import to_datetime

            # Use database default_date for consistency
            db_default_date = (
                adapter.db.default_date if hasattr(adapter, "db") else "2021-01-01"
            )
            begin_time = to_datetime(f"{db_default_date}T{begin_time}").to_numpy()
        travels = adapter.get_timed_travels_from_path(path, service_id, begin_time)

        # Convert TravelOnce objects to TravelOnceResponse with string times
        travel_responses = []
        for travel in travels:
            travel_responses.append(
                models.TravelOnceResponse(
                    trip_id=travel.trip_id,
                    departure_time=_np_datetime_to_time_str(travel.departure_time)
                    or "",
                    arrival_time=_np_datetime_to_time_str(travel.arrival_time) or "",
                    from_stop_id=travel.from_stop_id,
                    to_stop_id=travel.to_stop_id,
                    fare=travel.fare,
                )
            )

        return models.TimedTravelResponse(travels=travel_responses)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/travels")
async def path_travels(
    from_stop: str = Query(...),
    to_stop: str = Query(...),
    service_id: Optional[str] = Query(None),
):
    try:
        path = adapter.get_shortest_path(from_stop, to_stop, service_id)
        travels = adapter.get_travels_from_path(path, service_id)
        # convert TravelOnce objects to dicts if needed
        records = []
        for t in travels:
            if hasattr(t, "trip_id"):
                records.append(
                    {
                        "trip_id": t.trip_id,
                        "fare": t.fare,
                        "arrival_time": None,
                        "departure_time": None,
                        "from_stop_id": t.from_stop_id,
                        "to_stop_id": t.to_stop_id,
                    }
                )
            else:
                records.append(t)
        return {"travels": records}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
