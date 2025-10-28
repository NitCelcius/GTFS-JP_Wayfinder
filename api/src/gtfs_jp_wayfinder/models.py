import datetime

from pydantic import BaseModel


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
    trip_id: str
    arrival_time: str
    departure_time: str
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "trip_id": "平日_07時50分_系統34002",
                    "arrival_time": "07:50:00",
                    "departure_time": "07:50:00",
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
    lat: float
    lon: float
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
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "trip_id": "平日_07時50分_系統34002",
                    "stop_id": "1021_01",
                    "fare": 170,
                    "departure_time": "07:50:00",
                    "arrival_time": "07:50:00",
                },
            ],
        },
    }


class TravelOnceResponse(BaseModel):
    trip_id: str
    departure_time: str
    arrival_time: str
    from_stop_id: str
    to_stop_id: str
    fare: int
    model_config = {
        "json_schema_extra": {
            "examples": [
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
    }


class TripTimedStop(BaseModel):
    trip_id: str
    arrival_time: str
    departure_time: str
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
                    "stop_id": "1021_01",
                    "stop_sequence": 1,
                    "stop_headsign": "中央公園",
                    "stop_name": "中央公園",
                },
            ],
        },
    }


class TimedTravelResponse(BaseModel):
    travels: list[TravelOnceResponse]
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
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
    model_config = {"json_schema_extra": {"examples": [{"stop_names": ["中央公園"]}]}}


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
            "examples": [{"trip_id": "平日_06時33分_系統30101", "route_name": "太平線"}],
        },
    }


class PathResponse(BaseModel):
    path: list[str]
    model_config = {
        "json_schema_extra": {"examples": [{"path": ["1021_01", "3000_01", "6037_01"]}]},
    }


# Enriched/batch models
class TripInfo(BaseModel):
    trip_id: str
    route_name: str | None = None
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
    route_name: str | None = None
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
                    "route_name": "太平線",
                    "destination_display_name": "大学病院",
                },
            ],
        },
    }


class UpcomingBusEnriched(BaseModel):
    stop_id: str
    buses: list[EnrichedTrip]
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


class TravelRecord(BaseModel):
    """Represents a travel segment without specific departure/arrival times."""

    trip_id: str
    fare: int
    arrival_time: str | None = None
    departure_time: str | None = None
    from_stop_id: str
    to_stop_id: str
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "trip_id": "平日_07時50分_系統34002",
                    "fare": 170,
                    "arrival_time": None,
                    "departure_time": None,
                    "from_stop_id": "1021_01",
                    "to_stop_id": "6037_01",
                },
            ],
        },
    }


class TravelsResponse(BaseModel):
    """Response model for untimed travels."""

    travels: list[TravelRecord]
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "travels": [
                        {
                            "trip_id": "平日_07時50分_系統34002",
                            "fare": 170,
                            "arrival_time": None,
                            "departure_time": None,
                            "from_stop_id": "1021_01",
                            "to_stop_id": "6037_01",
                        },
                    ],
                },
            ],
        },
    }

