import datetime
import os

import numpy as np
from fastapi import APIRouter, HTTPException, Query

from gtfs_jp_wayfinder import models
from gtfs_jp_wayfinder.services import wayfinder as wf_service
from gtfs_jp_wayfinder.services import wayfinder_adapter as adapter
from gtfs_jp_wayfinder.utils.datetime import np_datetime_to_time_str

router = APIRouter()


def np_datetime_to_datetime_time(val: np.datetime64) -> datetime.time:
    """
    Convert numpy.datetime64 or datetime to datetime.time
    """
    if isinstance(val, datetime.datetime):
        return val.time()

    pyobj = val.astype("datetime64[ms]").astype(object)
    if isinstance(pyobj, datetime.datetime):
        return pyobj.time()

    raise TypeError(f"Cannot convert value of type {type(val)} to datetime.time")


@router.post(
    "/batch",
    response_model=models.TripInfoList,
    summary="運行情報のバッチ取得",
    description="複数の運行IDを一括で渡して TripInfo を取得します。バッチサイズは環境変数で制御されます。",
    responses={200: {"description": "成功"}},
)
async def batch_trips(
    body: models.TripIdList,
    limit: int | None = Query(None, description="返却件数上限（オプション）"),
):
    max_batch = int(os.environ.get("API_BATCH_MAX_TRIP_IDS", "10"))
    if len(body.trip_ids) > max_batch:
        raise HTTPException(
            status_code=400,
            detail=f"batch limit exceeded; max is {max_batch}",
        )
    if limit is not None and limit > max_batch:
        raise HTTPException(
            status_code=400,
            detail=f"limit too large; max is {max_batch}",
        )
    return adapter.get_trip_info_batch(body.trip_ids)


@router.get(
    "/fare",
    response_model=models.FareResponse,
    summary="運賃取得",
    description="2つの停留所ID間の運賃を返します。",
)
async def fare(
    from_id: str = Query(..., description="出発停留所ID"),
    to_id: str = Query(..., description="到着停留所ID"),
):
    try:
        fare_val = adapter.get_fare_by_stops(from_id, to_id)
        return models.FareResponse(fare=fare_val)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get(
    "/connections",
    response_model=models.TimedTravelResponse,
    summary="経路と便の取得",
    description="最短経路とその経路に沿った便（travels）を返します。",
)
async def get_connections(
    from_stop: str = Query(..., description="出発停留所ID"),
    to_stop: str = Query(..., description="到着停留所ID"),
    service_id: str | None = Query(None, description="サービスIDで絞り込み"),
):
    try:
        path = adapter.get_shortest_path(from_stop, to_stop, service_id)
        travels = adapter.get_travels_from_path(path, service_id)
        return models.TimedTravelResponse(travels=travels)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get(
    "/journey",
    response_model=list[models.TripRecord],
    summary="運行経路の旅程取得",
    description="指定運行IDと停留所から、その運行の以降の到着/出発/運賃情報を返します。",
)
async def get_journey(
    trip_id: str = Query(..., description="運行ID"),
    from_stop_id: str = Query(..., description="起点の停留所ID"),
):
    try:
        journey = (
            adapter.get_trip_journey(trip_id, from_stop_id)
            if hasattr(adapter, "get_trip_journey")
            else None
        )
        if journey is None:
            raise HTTPException(status_code=404, detail="not found")

        # Determine reference_date (use default date from adapter)
        reference_date = adapter.get_default_date()

        records = []
        for x in journey.itertuples():
            arrival_time_str = np_datetime_to_time_str(x.arrival_time)
            departure_time_str = np_datetime_to_time_str(x.departure_time)

            if not arrival_time_str or not departure_time_str:
                # Skip this record if times are missing (required fields)
                continue

            # Calculate datetime fields
            arrival_datetime = adapter.merge_date_and_time_to_iso(
                reference_date, arrival_time_str
            )
            departure_datetime = adapter.merge_date_and_time_to_iso(
                reference_date, departure_time_str
            )

            records.append(
                models.TripRecord(
                    trip_id=x.trip_id,
                    stop_id=x.stop_id,
                    fare=x.fare,
                    arrival_time=np_datetime_to_datetime_time(x.arrival_time),
                    departure_time=np_datetime_to_datetime_time(x.departure_time),
                    arrival_datetime=arrival_datetime,
                    departure_datetime=departure_datetime,
                )
            )

        return records
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get(
    "/{trip_id}",
    response_model=models.TripInfo,
    summary="運行情報の取得",
    description="単一の運行IDから TripInfo を取得します。指定された trip_id が存在しない場合は 404 を返します。",
    responses={
        200: {"description": "成功"},
        404: {"description": "指定された trip_id が見つかりません"},
    },
)
# TODO: add route_id, route_short_name field so client: bus-stop/BusTripDetail can use conversion logic
async def get_trip(trip_id: str):
    # First, check if the trip exists by attempting to get its route_id
    # This will raise ValueError if the trip doesn't exist
    try:
        wf_service.get_route_id_from_trip(trip_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="trip not found") from None

    # Trip exists, fetch the full info
    info = adapter.get_trip_info_batch([trip_id]).trips
    if not info:
        # Shouldn't happen if trip exists, but handle defensively
        raise HTTPException(status_code=404, detail="trip not found")
    return info[0]


@router.get(
    "/{trip_id}/stops",
    response_model=list[models.TripTimedStop],
    summary="運行の停留所一覧取得",
    description="運行に紐づく停留所と時刻の一覧を返します。from_stop_idを指定すると、その停留所からの運賃が計算されます。",
)
async def trip_stops(
    trip_id: str,
    from_stop_id: str | None = Query(
        None,
        description="運賃計算の起点となる停留所ID。指定した場合、この停留所から各停留所までの運賃が計算されます。",
    ),
):
    try:
        # Use default date to populate datetime fields
        reference_date = adapter.get_default_date()
        records = adapter.get_stops_from_trip(trip_id, reference_date, from_stop_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return records


@router.get(
    "/{trip_id}/passing",
    response_model=models.TripRecord,
    summary="通過時刻の取得",
    description="指定運行が指定停留所を通過する到着/出発時刻と運賃を返します。",
)
async def trip_passing(trip_id: str, stop_id: str = Query(..., description="停留所ID")):
    try:
        res = adapter.get_time_from_trip_and_stop(trip_id, stop_id)
        # res should be dict-like with arrival_time/departure_time/fare
        # Determine reference_date (use default date from adapter)
        reference_date = adapter.get_default_date()

        arrival_time_str = res.get("arrival_time") if isinstance(res, dict) else None
        departure_time_str = (
            res.get("departure_time") if isinstance(res, dict) else None
        )

        # Both times must be available for non-null datetime fields
        if not arrival_time_str or not departure_time_str:
            raise HTTPException(
                status_code=404,
                detail=f"Missing arrival/departure times for trip {trip_id} at stop {stop_id}",
            )

        # Calculate datetime fields (now always non-null)
        arrival_datetime = adapter.merge_date_and_time_to_iso(
            reference_date, arrival_time_str
        )
        departure_datetime = adapter.merge_date_and_time_to_iso(
            reference_date, departure_time_str
        )

        return models.TripRecord(
            trip_id=trip_id,
            stop_id=stop_id,
            fare=(res.get("fare") if isinstance(res, dict) else 0) or 0,
            departure_time=(
                res.get("departure_time") if isinstance(res, dict) else None
            ),
            arrival_time=(res.get("arrival_time") if isinstance(res, dict) else None),
            arrival_datetime=arrival_datetime,
            departure_datetime=departure_datetime,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
