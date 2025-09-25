from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from gtfs_jp_wayfinder.services import wayfinder_adapter as adapter
from src.gtfs_jp_wayfinder import models

router = APIRouter()


def parse_expand(expand_str: Optional[str]) -> List[str]:
    if not expand_str:
        return []
    tokens = [t.strip() for t in expand_str.split(",") if t.strip()]
    # validate tokens
    allowed = {"trip_info", "stops"}
    for t in tokens:
        if t not in allowed:
            raise HTTPException(status_code=400, detail=f"Invalid expand token: {t}")
    return tokens


@router.get(
    "/{stop_id}",
    response_model=models.StopNameList,
    summary="停留所名の取得",
    description="停留所IDから停留所名の一覧を取得します。見つからない場合は空配列を返します。",
    responses={
        200: {
            "description": "成功",
            "content": {"application/json": {"example": {"stop_names": ["中央公園"]}}},
        }
    },
)
async def get_stop(
    stop_id: str,
    fields: Optional[str] = Query(
        None, description="追加で取得するフィールド (例: location)"
    ),
):
    # For now we return names; location can be requested via fields=location
    try:
        names = adapter.get_stop_names(stop_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    if isinstance(names, list):
        return models.StopNameList(stop_names=names)
    return models.StopNameList(stop_names=[])


@router.get(
    "/",
    response_model=models.StopIdResponse,
    summary="停留所検索",
    description="名前で停留所を検索して stop_id の候補を返します。exact=true で厳密一致。",
    responses={
        200: {
            "description": "成功",
            "content": {
                "application/json": {
                    "example": {
                        "stop_ids": [{"stop_id": "1021_01", "stop_name": "中央公園"}]
                    }
                }
            },
        }
    },
)
async def search_stops(
    name: str = Query(..., description="検索する停留所名"),
    exact: bool = Query(False, description="厳密一致フラグ"),
):
    try:
        # underlying function is wf.get_stop_id
        from gtfs_jp_wayfinder.services.wayfinder import _wf

        if _wf is None:
            raise RuntimeError("Wayfinder not initialized")
        res = _wf.get_stop_id(name, exact)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    if res is None:
        return models.StopIdResponse(stop_ids=[])
    return models.StopIdResponse(stop_ids=res.to_dict("records"))


@router.get(
    "/{stop_id}/upcoming",
    response_model=models.UpcomingBusEnriched,
    summary="停留所の発着予定取得",
    description="指定停留所に来るバスの運行IDと到着/出発時刻を返します。`expand=trip_info` で経路情報を付与します。",
    responses={
        200: {
            "description": "成功",
            "content": {
                "application/json": {
                    "example": {
                        "stop_id": "1021_01",
                        "buses": [
                            {
                                "trip_id": "平日_06時50分_系統42202",
                                "arrival_time": "07:07:00",
                                "departure_time": "07:07:00",
                            }
                        ],
                    }
                }
            },
        }
    },
)
async def get_upcoming(
    stop_id: str,
    service_id: Optional[str] = Query(
        None, description="サービスIDで絞り込む (例: 平日)"
    ),
    expand: Optional[str] = Query(
        None, description="展開トークン (例: trip_info, stops)"
    ),
    limit: Optional[int] = Query(None, description="クライアント側の最大件数"),
):
    # validate expand tokens
    tokens = parse_expand(expand)

    # enforce limit if provided via environment
    max_batch = int(__import__("os").environ.get("API_BATCH_MAX_TRIP_IDS", "10"))
    if limit is not None and limit > max_batch:
        raise HTTPException(
            status_code=400, detail=f"limit too large; max is {max_batch}"
        )

    trips = adapter.get_trips_from_stop(stop_id, service_id)
    if trips is None:
        return models.UpcomingBusEnriched(stop_id=stop_id, buses=[])

    # Apply client limit if provided
    trips_list = list(trips)
    if limit is not None:
        trips_list = trips_list[:limit]

    # Default response: use EnrichedTrip (minimal fields) so the endpoint can return enriched or plain lists
    buses = []
    trip_ids = []
    for trip in trips_list:
        time_obj = adapter.get_time_from_trip_and_stop(trip, stop_id)
        arrival = time_obj and time_obj.get("arrival_time")
        departure = time_obj and time_obj.get("departure_time")
        buses.append(
            models.EnrichedTrip(
                trip_id=trip,
                arrival_time=arrival,
                departure_time=departure,
            )
        )
        trip_ids.append(trip)

    # If expand=trip_info or expand=stops, fetch batch info
    if "trip_info" in tokens:
        info = adapter.get_trip_info_batch(trip_ids).trips
        # map trip_id -> info
        info_map = {t.trip_id: t for t in info}
        enriched = []
        for b in buses:
            tinfo = info_map.get(b.trip_id)
            enriched.append(
                models.EnrichedTrip(
                    trip_id=b.trip_id,
                    arrival_time=b.arrival_time,
                    departure_time=b.departure_time,
                    route_name=tinfo.route_name if tinfo else None,
                    destination_display_name=tinfo.destination_display_name
                    if tinfo
                    else None,
                    destination_stop_id=tinfo.destination_stop_id if tinfo else None,
                )
            )
        return models.UpcomingBusEnriched(stop_id=stop_id, buses=enriched)

    # default
    return models.UpcomingBusEnriched(stop_id=stop_id, buses=buses)
