import datetime

from pydantic import BaseModel, Field


# Request models
class TripIdList(BaseModel):
    trip_ids: list[str]
    model_config = {
        "json_schema_extra": {
            "examples": [
                {"trip_ids": ["平日_07時50分_系統34002", "平日_09時10分_系統34002"]},
            ],
        },
    }


class ServiceId(BaseModel):
    service_id: str


# Response / domain models
class TripIdAndTime(BaseModel):
    """バス停の発着情報

    arrival_datetimeとdeparture_datetimeの日付部分は、begin_timeパラメータやAPIに与えた日付から決定されます。
    - begin_timeがISO 8601形式の場合は、指定された日付を使用します。
    - begin_timeがHH:MM:SS形式またはNoneの場合は、今日の日付を使用します。
    """

    trip_id: str
    arrival_time: str
    departure_time: str
    arrival_datetime: str = Field(...)
    departure_datetime: str = Field(...)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "trip_id": "平日_07時50分_系統34002",
                    "arrival_time": "07:50:00",
                    "departure_time": "07:50:00",
                    "arrival_datetime": "2025-10-28T07:50:00",
                    "departure_datetime": "2025-10-28T07:50:00",
                },
            ],
        },
    }


class UpcomingBus(BaseModel):
    stop_id: str
    buses: list[TripIdAndTime]
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "stop_id": "1021_01",
                    "buses": [
                        {
                            "trip_id": "平日_07時50分_系統34002",
                            "arrival_time": "07:50:00",
                            "departure_time": "07:50:00",
                        },
                    ],
                },
            ],
        },
    }


class StopLatLon(BaseModel):
    lat: float = Field(..., ge=-90, le=90, description="緯度 (度単位)")
    lon: float = Field(..., ge=-180, le=180, description="経度 (度単位)")
    model_config = {
        "json_schema_extra": {"examples": [{"lat": 39.71676, "lon": 140.13113}]},
    }


class StopCoordinateResponse(BaseModel):
    location: StopLatLon
    model_config = {
        "json_schema_extra": {
            "examples": [{"location": {"lat": 39.71676, "lon": 140.13113}}],
        },
    }


class FareResponse(BaseModel):
    fare: int

    model_config = {"json_schema_extra": {"examples": [{"fare": 170}]}}


class TripRecord(BaseModel):
    trip_id: str
    stop_id: str
    fare: int
    departure_time: datetime.time
    arrival_time: datetime.time
    departure_datetime: str = Field(...)
    arrival_datetime: str = Field(...)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "trip_id": "平日_07時50分_系統34002",
                    "stop_id": "1021_01",
                    "fare": 170,
                    "departure_time": "07:50:00",
                    "arrival_time": "07:50:00",
                    "departure_datetime": "2025-10-28T07:50:00",
                    "arrival_datetime": "2025-10-28T07:50:00",
                },
            ],
        },
    }


class TravelOnceResponse(BaseModel):
    """A single travel segment in a route.

    This model represents either a bus ride or a walk transfer between platforms.
    The `is_walk_transfer` field indicates the type of segment.

    For walk transfers:
    - `trip_id` will be the reserved value "WALK_TRANSFER"
    - `fare` will be 0
    - `departure_time` and `arrival_time` will be the same

    TODO: Refactor to discriminated union with `type` field for better type safety.
          See GitHub issue: https://github.com/NitCelcius/GTFS-JP_Wayfinder/issues/143
    """

    trip_id: str = Field(
        ...,
        description="GTFS trip ID, or 'WALK_TRANSFER' for platform transfers",
    )
    departure_time: str
    arrival_time: str
    departure_datetime: str = Field(...)
    arrival_datetime: str = Field(...)
    from_stop_id: str
    to_stop_id: str
    fare: int
    is_walk_transfer: bool = Field(
        default=False,
        description="True if this is a walk transfer between platforms at the same stop",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "trip_id": "t1",
                    "departure_time": "08:00:00",
                    "arrival_time": "08:30:00",
                    "departure_datetime": "2025-10-28T08:00:00",
                    "arrival_datetime": "2025-10-28T08:30:00",
                    "from_stop_id": "1021_01",
                    "to_stop_id": "6037_01",
                    "fare": 170,
                    "is_walk_transfer": False,
                },
                {
                    "trip_id": "WALK_TRANSFER",
                    "departure_time": "08:30:00",
                    "arrival_time": "08:30:00",
                    "departure_datetime": "2025-10-28T08:30:00",
                    "arrival_datetime": "2025-10-28T08:30:00",
                    "from_stop_id": "1021_01",
                    "to_stop_id": "1021_03",
                    "fare": 0,
                    "is_walk_transfer": True,
                },
            ],
        },
    }


class TripTimedStop(BaseModel):
    trip_id: str
    arrival_time: str
    departure_time: str
    arrival_datetime: str = Field(...)
    departure_datetime: str = Field(...)
    stop_id: str
    stop_sequence: int
    stop_headsign: str
    stop_name: str | None = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "trip_id": "t1",
                    "arrival_time": "08:00:00",
                    "departure_time": "08:00:00",
                    "arrival_datetime": "2025-10-28T08:00:00",
                    "departure_datetime": "2025-10-28T08:00:00",
                    "stop_id": "1021_01",
                    "stop_sequence": 1,
                    "stop_headsign": "中央公園",
                    "stop_name": "中央公園",
                },
            ],
        },
    }


class TimedTravelResponse(BaseModel):
    reference_date: str | None = None
    travels: list[TravelOnceResponse]
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "reference_date": "2025-10-28",
                    "travels": [
                        {
                            "trip_id": "t1",
                            "departure_time": "08:00:00",
                            "arrival_time": "08:30:00",
                            "from_stop_id": "1021_01",
                            "to_stop_id": "6037_01",
                            "fare": 170,
                        },
                    ],
                },
            ],
        },
    }


class StopNameList(BaseModel):
    stop_names: list[str]
    platform_code: str | None = Field(None, description='のりば番号 (例: "1", "2"など)')
    location: StopLatLon | None = None
    model_config = {
        "json_schema_extra": {
            "examples": [
                {"stop_names": ["中央公園"], "platform_code": None},
                {
                    "stop_names": ["秋田駅西口"],
                    "platform_code": "2",
                },
                {
                    "stop_names": ["中央公園"],
                    "platform_code": None,
                    "location": {"lat": 39.71676, "lon": 140.13113},
                },
            ]
        }
    }


class StopIdAndName(BaseModel):
    stop_id: str
    stop_name: str


class StopIdResponse(BaseModel):
    stop_ids: list[StopIdAndName]
    model_config = {
        "json_schema_extra": {
            "examples": [
                {"stop_ids": [{"stop_id": "1021_01", "stop_name": "中央公園"}]},
            ],
        },
    }


class TripAndDestDisplayName(BaseModel):
    trip_id: str
    destination_display_name: str
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "trip_id": "平日_06時33分_系統30101",
                    "destination_display_name": "大学病院",
                },
            ],
        },
    }


class TripAndDestStopId(BaseModel):
    trip_id: str
    destination_stop_id: str
    model_config = {
        "json_schema_extra": {
            "examples": [
                {"trip_id": "平日_06時33分_系統30101", "destination_stop_id": "404"},
            ],
        },
    }


class TripIdAndRouteName(BaseModel):
    trip_id: str
    route_name: str
    model_config = {
        "json_schema_extra": {
            "examples": [
                {"trip_id": "平日_06時33分_系統30101", "route_name": "太平線"}
            ],
        },
    }


class PathResponse(BaseModel):
    path: list[str]
    model_config = {
        "json_schema_extra": {
            "examples": [{"path": ["1021_01", "3000_01", "6037_01"]}]
        },
    }


# Enriched/batch models
class TripInfo(BaseModel):
    trip_id: str
    route_name: str | None
    destination_display_name: str | None = None
    destination_stop_id: str | None = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "trip_id": "平日_07時50分_系統34002",
                    "route_name": "太平線",
                    "destination_display_name": "大学病院",
                    "destination_stop_id": "404",
                },
            ],
        },
    }


class TripInfoList(BaseModel):
    trips: list[TripInfo]
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "trips": [
                        {
                            "trip_id": "平日_07時50分_系統34002",
                            "route_name": "太平線",
                            "destination_display_name": "大学病院",
                            "destination_stop_id": "404",
                        },
                    ],
                },
            ],
        },
    }


class EnrichedTrip(BaseModel):
    trip_id: str
    arrival_time: str
    departure_time: str
    arrival_datetime: str = Field(...)
    departure_datetime: str = Field(...)
    route_name: str | None
    destination_display_name: str | None = None
    destination_stop_id: str | None = None
    stops: list[TripTimedStop] | None = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "trip_id": "平日_07時50分_系統34002",
                    "arrival_time": "07:50:00",
                    "departure_time": "07:50:00",
                    "arrival_datetime": "2025-10-28T07:50:00",
                    "departure_datetime": "2025-10-28T07:50:00",
                    "route_name": "太平線",
                    "destination_display_name": "大学病院",
                },
            ],
        },
    }


class UpcomingBusEnriched(BaseModel):
    stop_id: str
    reference_date: str | None = None
    buses: list[EnrichedTrip]
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "stop_id": "1021_01",
                    "reference_date": "2025-10-28",
                    "buses": [
                        {
                            "trip_id": "平日_07時50分_系統34002",
                            "arrival_time": "07:50:00",
                            "departure_time": "07:50:00",
                            "route_name": "太平線",
                        },
                    ],
                },
            ],
        },
    }


class NearbyStop(BaseModel):
    stop_id: str
    stop_name: str
    distance_km: float
    lat: float
    lon: float
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "stop_id": "1021_01",
                    "stop_name": "中央公園",
                    "distance_km": 0.25,
                    "lat": 39.71676,
                    "lon": 140.13113,
                },
            ],
        },
    }


class NearbyStopsResponse(BaseModel):
    stops: list[NearbyStop]
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "stops": [
                        {
                            "stop_id": "1021_01",
                            "stop_name": "中央公園",
                            "distance_km": 0.25,
                            "lat": 39.71676,
                            "lon": 140.13113,
                        },
                        {
                            "stop_id": "2001_01",
                            "stop_name": "市役所前",
                            "distance_km": 0.45,
                            "lat": 39.71876,
                            "lon": 140.13213,
                        },
                    ],
                },
            ],
        },
    }
