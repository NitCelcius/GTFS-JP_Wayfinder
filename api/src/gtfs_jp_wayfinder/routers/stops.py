import warnings

from fastapi import APIRouter, HTTPException, Query

from gtfs_jp_wayfinder import models
from gtfs_jp_wayfinder.services import wayfinder_adapter as adapter

router = APIRouter()


def parse_expand(expand_str: str | None) -> list[str]:
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
    "/nearby",
    response_model=models.NearbyStopsResponse,
    summary="近隣停留所の検索",
    description="緯度・経度から近い順に停留所を返します。距離はキロメートル単位で計算されます。",
    responses={
        200: {
            "description": "成功",
            "content": {
                "application/json": {
                    "example": {
                        "stops": [
                            {
                                "stop_id": "1021_01",
                                "stop_name": "中央公園",
                                "distance_km": 0.25,
                                "lat": 39.71676,
                                "lon": 140.13113,
                            },
                        ],
                    },
                },
            },
        },
    },
)
async def get_nearby_stops(
    lat: float = Query(..., description="緯度 (度単位)", ge=-90, le=90),
    lon: float = Query(..., description="経度 (度単位)", ge=-180, le=180),
    limit: int | None = Query(None, description="取得する最大件数"),
):
    """Get nearby bus stops based on latitude and longitude coordinates.

    Environment Variables:
        API_NEARBY_STOPS_MAX_LIMIT: Maximum allowed limit (default: 100)
    """
    # Get max limit from environment variable, default 100
    max_limit = int(__import__("os").environ.get("API_NEARBY_STOPS_MAX_LIMIT", "100"))

    # If no limit specified, use the max limit (return as many as possible)
    if limit is None:
        limit = max_limit

    # Enforce maximum limit
    if limit > max_limit:
        raise HTTPException(
            status_code=400,
            detail=f"limit too large; max is {max_limit}",
        )

    if limit <= 0:
        raise HTTPException(status_code=400, detail="limit must be positive")

    try:
        nearby_stops = adapter.get_nearby_stops(lat, lon, limit)

        stops = [
            models.NearbyStop(
                stop_id=stop.stop_id,
                stop_name=stop.stop_name,
                distance_km=stop.distance_km,
                lat=stop.stop_lat,
                lon=stop.stop_lon,
            )
            for stop in nearby_stops
        ]

        return models.NearbyStopsResponse(stops=stops)

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get(
    "/{stop_id}",
    response_model=models.StopNameList,
    summary="停留所情報の取得",
    description="停留所IDから停留所名、のりば番号、位置情報を取得します。見つからない場合は空配列を返します。`_fields=location` で位置情報を含めます。",
    responses={
        200: {
            "description": "成功",
            "content": {
                "application/json": {
                    "examples": {
                        "basic": {
                            "value": {"stop_names": ["中央公園"], "platform_code": None}
                        },
                        "with_platform": {
                            "value": {
                                "stop_names": ["秋田駅西口"],
                                "platform_code": "2",
                            }
                        },
                        "with_location": {
                            "value": {
                                "stop_names": ["中央公園"],
                                "platform_code": None,
                                "location": {"lat": 39.71676, "lon": 140.13113},
                            }
                        },
                    }
                }
            },
        },
    },
)
async def get_bus_stop_info(
    stop_id: str,
    _fields: str | None = Query(
        None,
        description="追加で取得するフィールド (例: location)。カンマ区切りで複数指定可能。",
    ),
):
    # Get stop names
    try:
        names = adapter.get_stop_names(stop_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    if not isinstance(names, list):
        names = []

    # Get platform_code
    platform_code = None
    try:
        platform_code = adapter.get_platform_code(stop_id)
    except KeyError as e:
        # If stop_id not found, raise 400 error
        # This shouldn't happen if get_stop_names succeeded
        warnings.warn(
            f"Could not fetch platform_code for stop {stop_id}: {e}", stacklevel=2
        )
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    # Parse requested fields (comma-separated)
    requested_fields = set()
    if _fields:
        requested_fields = {
            field.strip() for field in _fields.split(",") if field.strip()
        }

    # Check if location field is requested
    location = None
    if "location" in requested_fields:
        try:
            lat_lon = adapter.get_stop_lat_lon(stop_id)
            location = models.StopLatLon(lat=lat_lon[0], lon=lat_lon[1])
        except Exception as e:
            # If location not found, just omit it (location remains None)
            warnings.warn(
                f"Could not fetch location for stop {stop_id}: {e}", stacklevel=2
            )

    return models.StopNameList(
        stop_names=names, platform_code=platform_code, location=location
    )


@router.get(
    "/{stop_id}/platforms",
    response_model=models.RelatedPlatformsResponse,
    summary="関連のりば一覧の取得（のりば切替用）",
    description="同じ停留所名を持つ別ののりば（platform_code違い）を返します。のりば切替機能で使用されます。",
    responses={
        200: {
            "description": "成功",
            "content": {
                "application/json": {
                    "examples": {
                        "with_platforms": {
                            "summary": "のりばがある停留所",
                            "value": {
                                "stops": [
                                    {
                                        "stop_id": "1022_02",
                                        "stop_name": "秋田駅西口",
                                        "platform_code": "2",
                                        "lat": 39.71729,
                                        "lon": 140.12843,
                                    },
                                    {
                                        "stop_id": "1022_03",
                                        "stop_name": "秋田駅西口",
                                        "platform_code": "3",
                                        "lat": 39.71719,
                                        "lon": 140.12843,
                                    },
                                ],
                            },
                        },
                        "single_stop": {
                            "summary": "のりばが一つしかない停留所",
                            "value": {
                                "stops": [
                                    {
                                        "stop_id": "1021_01",
                                        "stop_name": "中央公園",
                                        "platform_code": None,
                                        "lat": 39.71676,
                                        "lon": 140.13113,
                                    },
                                ],
                            },
                        },
                    },
                },
            },
        },
        400: {
            "description": "停留所が見つからない場合",
        },
    },
)
async def get_related_platforms(stop_id: str):
    """Get all related platform stops (stops with the same name but different platform codes).

    This endpoint is used for platform switching (のりば切替) functionality
    to find other platforms at the same bus stop location.
    """
    try:
        related_platforms = adapter.get_related_platforms(stop_id)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    stops = [
        models.StopWithPlatform(
            stop_id=stop["stop_id"],
            stop_name=stop["stop_name"],
            platform_code=stop["platform_code"],
            lat=stop["stop_lat"],
            lon=stop["stop_lon"],
        )
        for stop in related_platforms
    ]

    return models.RelatedPlatformsResponse(stops=stops)


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
                        "stop_ids": [{"stop_id": "1021_01", "stop_name": "中央公園"}],
                    },
                },
            },
        },
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
        raise HTTPException(status_code=400, detail=str(e)) from e
    if res is None:
        return models.StopIdResponse(stop_ids=[])
    return models.StopIdResponse(stop_ids=res.to_dict("records"))


@router.get(
    "/{stop_id}/upcoming",
    response_model=models.UpcomingBusEnriched,
    summary="停留所の発着予定取得",
    description="指定停留所に来るバスの運行IDと到着/出発時刻を返します。`expand=trip_info` で経路情報を付与、`expand=stops` で各便の停留所情報を付与します。",
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
                            },
                        ],
                    },
                },
            },
        },
    },
)
async def get_upcoming(
    stop_id: str,
    service_id: str | None = Query(None, description="サービスIDで絞り込む (例: 平日)"),
    expand: str | None = Query(None, description="展開トークン (例: trip_info, stops)"),
    limit: int | None = Query(
        None,
        ge=1,
        description="クライアント側の最大件数",
    ),
    begin_time: str | None = Query(
        None,
        description=(
            "開始時刻 (HH:MM:SS または ISO 8601 形式 (e.g., 2025-10-28T14:30:00). "
            "HH:MM:SS形式の場合、今日の日付が基準日として使用されます。"
            "ISO 8601形式の場合、`begin_time`で指定された日付が基準日として使用されます。"
        ),
    ),
    include_ending: bool = Query(
        False,
        description="終点となるバスを含めるかどうか。デフォルトは False（終点となるバスを非表示）。",
    ),
):
    # Parse begin_time parameter to determine reference_date and time filter
    # (handles both HH:MM:SS and ISO datetime formats)
    try:
        reference_date_obj, parsed_time = adapter.parse_split_date_str(begin_time)
        reference_date = reference_date_obj.isoformat()
        # Only use the parsed time as a filter if begin_time was explicitly provided
        min_arrival_time = parsed_time if begin_time else None
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    # validate expand tokens
    tokens = parse_expand(expand)

    # Get max batch limit from environment
    max_batch = int(__import__("os").environ.get("API_BATCH_MAX_TRIP_IDS", "100"))

    # If no limit provided, use max_batch as default; otherwise validate it
    if limit is None:
        limit = max_batch
    elif limit > max_batch:
        raise HTTPException(
            status_code=400,
            detail=f"limit too large; max is {max_batch}",
        )

    trips = adapter.get_trips_from_stop(stop_id, service_id)
    if trips is None:
        return models.UpcomingBusEnriched(
            stop_id=stop_id,
            reference_date=reference_date,
            buses=[],
        )

    # Convert to list for processing
    trips_list = list(trips)

    # OPTIMIZATION 1: Batch fetch all arrival/departure times at once instead of N individual queries
    # Pass min_arrival_time to filter out buses that have already departed
    # The max_items parameter is applied after filtering, ensuring we get the right number of results
    time_map = adapter.get_times_from_trips_and_stop_batch(
        trips_list,
        stop_id,
        min_arrival_time=min_arrival_time,
        max_items=limit,
    )

    # Build base buses list using batch-fetched times
    buses = []
    trip_ids = []
    for trip in trips_list:
        time_obj = time_map.get(trip, {})
        arrival = time_obj.get("arrival_time")
        departure = time_obj.get("departure_time")

        # Enforce non-null times (required for non-null datetime fields)
        if not arrival or not departure:
            warnings.warn(
                f"Skipping trip {trip} for stop {stop_id} due to missing arrival/departure times",
                stacklevel=2,
            )
            continue

        # Convert time fields to ISO datetime format (required fields)
        arrival_datetime = adapter.merge_date_and_time_to_iso(reference_date, arrival)
        departure_datetime = adapter.merge_date_and_time_to_iso(
            reference_date, departure
        )

        buses.append(
            models.EnrichedTrip(
                trip_id=trip,
                arrival_time=arrival,
                departure_time=departure,
                arrival_datetime=arrival_datetime,
                departure_datetime=departure_datetime,
                route_name=None,
            ),
        )
        trip_ids.append(trip)

    # Always fetch trip info to populate route_name (even for default case)
    info_map = {}
    info = adapter.get_trip_info_batch(trip_ids).trips
    info_map = {t.trip_id: t for t in info}

    # OPTIMIZATION 2: Parallel fetch stops data only if requested
    stops_map = {}
    if "stops" in tokens:
        try:
            # Use parallel fetching for better performance
            stops_map = await adapter.get_stops_from_trips_parallel(
                trip_ids,
                reference_date,
            )
        except Exception:
            # Fallback to sequential if parallel approach fails
            for trip_id in trip_ids:
                try:
                    stops_data = adapter.get_stops_from_trip(trip_id, reference_date)
                    stops_map[trip_id] = stops_data
                except Exception:
                    stops_map[trip_id] = None

    # Enrich all buses with trip_info and optionally stops
    enriched = []
    for b in buses:
        tinfo = info_map.get(b.trip_id)
        stops_data = stops_map.get(b.trip_id) if "stops" in tokens else None
        enriched.append(
            models.EnrichedTrip(
                trip_id=b.trip_id,
                arrival_time=b.arrival_time,
                departure_time=b.departure_time,
                arrival_datetime=b.arrival_datetime,
                departure_datetime=b.departure_datetime,
                route_id=tinfo.route_id if tinfo else None,
                route_name=tinfo.route_name if tinfo else None,
                destination_display_name=tinfo.destination_display_name
                if tinfo
                else None,
                destination_stop_id=tinfo.destination_stop_id if tinfo else None,
                stops=stops_data,
            ),
        )

    # Filter out buses that end at this stop unless include_ending=True
    # Note: Trips with None destination_stop_id are kept (treated as passing through)
    if not include_ending:
        enriched = [trip for trip in enriched if trip.destination_stop_id != stop_id]

    # Sort buses by arrival time (earliest first)
    enriched.sort(key=lambda trip: trip.arrival_time)

    return models.UpcomingBusEnriched(
        stop_id=stop_id,
        reference_date=reference_date,
        buses=enriched,
    )
