import datetime

from fastapi import APIRouter, HTTPException, Query
from pandas import to_datetime

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
        # Convert to pandas datetime for better handling
        pd_datetime = to_datetime(np_datetime)

        # Extract time in HH:MM:SS format
        return pd_datetime.strftime("%H:%M:%S")
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
    service_id: str | None = Query(None, description="サービスIDで絞り込み"),
):
    try:
        path = adapter.get_shortest_path(from_stop, to_stop, service_id)
        return models.PathResponse(path=path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get(
    "/timed_search",
    response_model=models.TimedTravelResponse,
    summary="時刻考慮経路検索",
    description="開始時刻に基づいた時刻付き経路検索を行い、travels を返します。",
)
async def timed_search(
    from_stop: str = Query(..., description="出発停留所ID"),
    to_stop: str = Query(..., description="到着停留所ID"),
    service_id: str | None = Query(None, description="サービスID"),
    begin_time: str | None = Query(
        None,
        description="開始時刻 (HH:MM:SS形式またはISO 8601形式 例: 2025-10-28T14:30:00)",
    ),
):
    try:
        # Validate begin_time parameter early
        if begin_time is None:
            raise HTTPException(
                status_code=400,
                detail="begin_time parameter is required for timed search",
            )

        # Determine reference_date and begin_time_str from begin_time parameter
        reference_date = datetime.date.today().isoformat()
        begin_time_str = begin_time

        if "T" in begin_time:
            try:
                reference_date, begin_time_str = (
                    adapter.extract_date_and_time_from_iso_datetime(begin_time)
                )
            except ValueError as e:
                raise HTTPException(status_code=400, detail=str(e)) from e

        # Convert begin_time string to numpy datetime64
        db_default_date = adapter.get_default_date()
        begin_time_np = to_datetime(f"{db_default_date}T{begin_time_str}").to_numpy()

        # Get timed travels (returns empty list if no buses available)
        path = adapter.get_shortest_path(from_stop, to_stop, service_id)

        travels = adapter.get_timed_travels_from_path(path, service_id, begin_time_np)

        # Convert TravelOnce objects to TravelOnceResponse with string times
        travel_responses = []
        for travel in travels:
            departure_time_str = _np_datetime_to_time_str(travel.departure_time)
            arrival_time_str = _np_datetime_to_time_str(travel.arrival_time)

            if not departure_time_str or not arrival_time_str:
                # Skip this travel if times are missing (required fields)
                continue

            # Calculate datetime fields
            departure_datetime = adapter.merge_date_and_time_to_iso(
                reference_date, departure_time_str
            )
            arrival_datetime = adapter.merge_date_and_time_to_iso(
                reference_date, arrival_time_str
            )

            travel_responses.append(
                models.TravelOnceResponse(
                    trip_id=travel.trip_id,
                    departure_time=departure_time_str,
                    arrival_time=arrival_time_str,
                    departure_datetime=departure_datetime,
                    arrival_datetime=arrival_datetime,
                    from_stop_id=travel.from_stop_id,
                    to_stop_id=travel.to_stop_id,
                    fare=travel.fare,
                )
            )

        return models.TimedTravelResponse(
            reference_date=reference_date,
            travels=travel_responses,
        )
    except HTTPException:
        raise
    except Exception as e:
        # Convert other exceptions to 400 Bad Request
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("/travels")
async def path_travels(
    from_stop: str = Query(...),
    to_stop: str = Query(...),
    service_id: str | None = Query(None),
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
                    },
                )
            else:
                records.append(t)
        return {"travels": records}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
