import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Annotated

import networkx
import numpy as np
import uvicorn
from fastapi import FastAPI, HTTPException, Path, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from gtfs_jp_wayfinder.busloc_grabber import BusLocGrabber
from gtfs_jp_wayfinder.busstop_grabber import BusStopGrabber
from gtfs_jp_wayfinder.database import AkitaBusWayFinder, TravelOnce

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


wf = AkitaBusWayFinder()
blc = BusLocGrabber()
bsc = BusStopGrabber()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Startup")

    # バックグラウンドで動かす (turbo が固まらないように)
    async def _init():
        try:
            await asyncio.to_thread(wf.initialize, "./data/gtfs-akita-chuo-kotsu/")
            logger.info("Initialization completed")
        except Exception as e:
            logger.exception("Initialization failed: %s", e)

    # If you want the server to wait until initialization completes, await it here.
    # This will block the lifespan until wf.initialize finishes, so Uvicorn's
    # "Application startup complete" will appear only after initialization.
    await _init()

    # If instead you want background initialization but still be able to await
    # it later, do:
    # task = asyncio.create_task(_init())
    # await task  # or don't await to keep it running in background

    yield
    logger.info("Bye")


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localho.st:8000",
        "http://localho.st:80",
        "http://localho.st:5500",
        "http://localhost:8000",
        "http://localhost:5500",
        "http://localhost:80",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:5500http://127.0.0.1:80http://127.0.0.1:8002",
        "http://localhost:8002",
        "http://192.168.0.5:8000",
        "http://192.168.0.5:8002",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

StopIdPath = Annotated[str, Path(description="バス停のID")]

StopIdQuery = Annotated[str, Query(description="バス停のID")]

StopNameQuery = Annotated[str, Query(description="バス停の名前")]

TripIdQuery = Annotated[
    str, Query(description="バスの運行ID", examples=["平日_06時33分_系統30101"])
]

ServiceIdQuery = Annotated[
    str, Query(description="バスの運行種別ID", examples=["平日", "土日祝"])
]

TimeOnlyQuery = Annotated[
    str, Query(description="時刻 (HH:MM:SS の形式)", examples=["07:00:00"])
]


class TripIdList(BaseModel):
    trip_ids: list[TripIdQuery]
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "trip_ids": [
                        "平日_07時50分_系統34002",
                        "平日_09時10分_系統34002",
                        "平日_11時20分_系統34102",
                    ]
                }
            ]
        }
    }


class ServiceId(BaseModel):
    service_id: str


class TripIdAndTime(BaseModel):
    trip_id: str
    arrival_time: str
    departure_time: str


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
                            "trip_id": "平日_06時50分_系統42202",
                            "arrival_time": "07:07:00",
                            "departure_time": "07:07:00",
                        },
                        {
                            "trip_id": "平日_07時07分_系統43002",
                            "arrival_time": "07:24:00",
                            "departure_time": "07:24:00",
                        },
                    ],
                }
            ]
        }
    }


class StopLatLon(BaseModel):
    lat: float
    lon: float


class StopCoordinateResponse(BaseModel):
    location: StopLatLon

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"location": {"lat": 39.7167605183501, "lon": 140.131130218506}}
            ]
        }
    }


class FareResponse(BaseModel):
    fare: int
    model_config = {"json_schema_extra": {"examples": [{"fare": 170}]}}


class TripRecord(BaseModel):
    trip_id: str
    stop_id: str
    fare: int
    departure_time: str
    arrival_time: str


class TravelOnceResponse(BaseModel):
    trip_id: str
    departure_time: str
    arrival_time: str
    from_stop_id: str
    to_stop_id: str
    fare: int


class TripTimedStop(BaseModel):
    trip_id: str
    arrival_time: str
    departure_time: str
    stop_id: str
    stop_sequence: int
    stop_headsign: str


class TimedTravelResponse(BaseModel):
    travels: list[TravelOnceResponse]


@app.get("/")
async def root():
    return {"message": "Hello"}


class StopNameList(BaseModel):
    stop_names: list[str]

    model_config = {
        "json_schema_extra": {
            "examples": [{"stop_names": ["秋田駅西口", "秋田駅東口"]}]
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
                {
                    "stop_ids": [
                        {"stop_id": "1021_01", "stop_name": "秋田駅東口"},
                        {"stop_id": "1021_03", "stop_name": "秋田駅東口"},
                    ]
                }
            ]
        }
    }


class TripAndDestDisplayName(BaseModel):
    trip_id: TripIdQuery
    destination_display_name: str
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "trip_id": "平日_06時33分_系統30101",
                    "destination_display_name": "太平・岩見三内（長崎屋・秋田駅西口・大学病院 経由）",
                }
            ]
        }
    }


class TripAndDestStopId(BaseModel):
    trip_id: TripIdQuery
    destination_stop_id: str
    model_config = {
        "json_schema_extra": {
            "examples": [
                {"trip_id": "平日_06時33分_系統30101", "destination_stop_id": "404"}
            ]
        }
    }


class TripIdAndRouteName(BaseModel):
    trip_id: TripIdQuery
    route_name: str
    model_config = {
        "json_schema_extra": {
            "examples": [{"trip_id": "平日_06時33分_系統30101", "route_name": "太平線"}]
        }
    }


class PathResponse(BaseModel):
    path: list[str]


# TravelOnceResponse に変換する
# TravelOnceResponse は、TravelOnce の内容を JSON に変換するためのクラス
# Numpy.datetime64 を str に変換したりなど含まれるが、不可逆なので応答するときのみ使うこと！
def travel_once_to_travel_once_response(val: TravelOnce) -> TravelOnceResponse:
    return TravelOnceResponse(
        trip_id=val.trip_id,
        arrival_time=wf.np_datetime_truncate_to_str(val.arrival_time),
        departure_time=wf.np_datetime_truncate_to_str(val.departure_time),
        from_stop_id=val.from_stop_id,
        to_stop_id=val.to_stop_id,
        fare=val.fare,
    )


@app.get(
    path="/stops/name/{stop_id}",
    summary="バス停のIDから名前を検索する",
    description="バス停が見つからない場合は空のリストを返す",
    response_model=StopNameList,
)
async def get_stop_name(stop_id: StopIdPath) -> StopNameList:
    stop_names = wf.get_stop_name(stop_id)
    if isinstance(stop_names, list):
        return StopNameList(stop_names=stop_names)
    if stop_names is None:
        return StopNameList(stop_names=[])


class TripRecordsResponse(BaseModel):
    records: list[TripRecord]
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "records": [
                        {
                            "trip_id": "平日_07時50分_系統34002",
                            "fare": 0,
                            "arrival_time": "2021-01-01T07:50:00",
                            "departure_time": "2021-01-01T07:50:00",
                            "stop_id": "1021_01",
                        },
                        {
                            "trip_id": "平日_07時50分_系統34002",
                            "fare": 170,
                            "arrival_time": "2021-01-01T07:50:00",
                            "departure_time": "2021-01-01T07:50:00",
                            "stop_id": "6037_01",
                        },
                    ]
                }
            ]
        }
    }


@app.get(
    path="/trips/journey",
    summary="あるバス停と運行IDから、それ以降に該当する運行IDのバスが移動する先の運賃、到着時間を取得する",
    response_model=TripRecordsResponse,
)
async def get_trip_journey(
    trip_id: TripIdQuery, from_stop_id: StopIdQuery
) -> TripRecordsResponse:
    try:
        journey = wf.get_trip_journey(trip_id, from_stop_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    # for index in journey.index:
    #     ret[index] = {
    #         "trip_id": journey[journey == index]["trip_id"]
    #     }
    records = []
    for x in journey.to_dict("records"):
        records.append(
            TripRecord(
                trip_id=x["trip_id"],
                stop_id=x["stop_id"],
                fare=x["fare"],
                arrival_time=wf.np_datetime_truncate_to_str(x["arrival_time"]),
                departure_time=wf.np_datetime_truncate_to_str(x["departure_time"]),
            )
        )
    return TripRecordsResponse(records=records)


@app.get(
    path="/stops/upcoming/{stop_id}",
    summary="バス停のIDから、そのバス停に来るバスの運行IDと時間を取得する",
    description="service_id を指定すると、そのservice_idを持つバスに限って取得する",
    responses={
        400: {"description": "バス停IDが指定されていない、あるいは存在しない場合"}
    },
    response_model=UpcomingBus,
)
async def get_upcoming_bus(
    stop_id: StopIdPath, service_id: ServiceId = None
) -> UpcomingBus:
    trip_list = wf.get_trips_from_stop(stop_id, service_id)
    bus_list = []
    if trip_list is None:
        return UpcomingBus(stop_id=stop_id, buses=[])
    for trip in trip_list:
        try:
            time_obj = wf.get_time_from_trip_and_stop(trip, stop_id)
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail="Error while trying to obtain passing time from trip "
                + trip
                + ", stop_id"
                + stop_id
                + ": "
                + str(e),
            )
        bus_list.append(
            TripIdAndTime(
                trip_id=trip,
                arrival_time=wf.np_datetime_truncate_to_str(time_obj["arrival_time"]),
                departure_time=wf.np_datetime_truncate_to_str(
                    time_obj["departure_time"]
                ),
            )
        )
    return UpcomingBus(stop_id=stop_id, buses=bus_list)


@app.get(
    path="/stops/location/{stop_id}",
    summary="バス停の緯度経度を検索する",
    responses={400: {"description": "バス停が見つからない場合"}},
    response_model=StopCoordinateResponse,
)
async def get_stop_coordinates(stop_id: StopIdPath) -> StopCoordinateResponse:
    try:
        location = wf.get_stop_lat_lon(stop_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return StopCoordinateResponse(location=StopLatLon(lat=location[0], lon=location[1]))


@app.get(
    path="/stops/search",
    summary="バス停の名前からバス停IDを検索する",
    description="バス停の名前は完全一致検索",
    response_model=StopIdResponse,
)
async def get_stop_id(
    stop_name: StopNameQuery,
    exact: Annotated[
        bool,
        Query(
            title="完全一致検索",
            description="完全一致検索を行うかどうか",
        ),
    ] = False,
) -> StopIdResponse:
    stop_ids = wf.get_stop_id(stop_name, exact)
    if stop_ids is None:
        return StopIdResponse(stop_ids=[])
    return StopIdResponse(stop_ids=stop_ids.to_dict("records"))


@app.get(
    path="/trips/fare",
    summary="バス停間の運賃を取得する",
    description="from と to にはバス停IDを指定する。逆順は受け入れられない場合がある",
    responses={400: {"description": "バス停IDが見つからない場合"}},
    response_model=FareResponse,
)
async def get_fare_id_from_stops(
    from_id: StopIdQuery, to_id: StopIdQuery
) -> FareResponse:
    try:
        fare_id = wf.get_fare_route_by_stops(from_id, to_id)["fare_id"].values[0]
        fare = wf.get_fare_from_id(fare_id).item()  # 地味に numpy.int64 だったという話
        return FareResponse(fare=fare)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get(
    path="/trips/connections",
    summary="2つのバス停間を結ぶすべての運行IDを取得する",
    description="service_id が指定された場合、それを持つ運行IDのみを取得する",
    responses={400: {"description": "バス停IDが指定されていないエラー"}},
    response_model=TripIdList,
)
# TODO: こちらも曜日対応
async def get_trips_from_stops(
    from_id: StopIdQuery, to_id: StopIdQuery, service_id: ServiceId | None = None
) -> TripIdList:
    if from_id is None:
        raise HTTPException(
            status_code=400,
            detail="Please specify departure bus stop id with ?from={bus stop id}.",
        )
    if to_id is None:
        raise HTTPException(
            status_code=400,
            detail="Please specify arrival bus stop id with ?to={bus stop id}.",
        )
    try:
        trips = wf.get_trips_from_stops(from_id, to_id, service_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return TripIdList(trip_ids=trips)


@app.get(
    path="/trips/times",
    summary="運行IDに対し、2つのバス停間の出発、到着時間を取得する",
    description="trip_id は from -> to の順番で指定しないと、departure と arrival の順番が逆になることもある",
    responses={
        400: {
            "description": "バス停IDが指定されていない、運行IDが指定されていないエラー"
        }
    },
)
async def get_trip_times(
    from_id: StopIdQuery, to_id: StopIdQuery, trip_id: TripIdQuery
):
    if from_id is None:
        raise HTTPException(
            status_code=400,
            detail="Please specify departure bus stop id with ?from={bus stop id}.",
        )
    if to_id is None:
        raise HTTPException(
            status_code=400,
            detail="Please specify arrival bus stop id with ?to={bus stop id}.",
        )
    if trip_id is None:
        raise HTTPException(
            status_code=400, detail="Please specify trip id with ?trip={trip id}."
        )
    try:
        dep_time, arr_time = wf.get_trip_times(from_id, to_id, trip_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"times": {"departure": dep_time, "arrival": arr_time}}


@app.get(
    path="/trips/stop_list",
    summary="運行IDに対し、その運行IDが止まるすべてのバス停ID、時刻、順番を取得する",
)
async def get_next_stops_from_trip_id(trip_id: TripIdQuery) -> list[TripTimedStop]:
    try:
        res = wf.get_stops_from_trip(trip_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    record = res.to_dict("records")
    for rec in record:
        rec["arrival_time"] = wf.np_datetime_truncate_to_str(rec["arrival_time"])
        rec["departure_time"] = wf.np_datetime_truncate_to_str(rec["departure_time"])
    return record


@app.get(
    path="/trips/dest_name",
    summary="運行IDを持つバスが表示する行き先表示板の内容を取得する",
    description="運行IDが見つからない場合はエラーを返す",
    responses={
        400: {
            "description": "運行IDに対応する経路IDが見つからない場合 (route_id が見つからないエラーは想定外)"
        }
    },
)
async def get_trip_destination_display_name(
    trip_id: TripIdQuery,
) -> TripAndDestDisplayName:
    try:
        res = wf.get_destination_display_name_from_route(
            wf.get_route_id_from_trip(trip_id)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return TripAndDestDisplayName(trip_id=trip_id, destination_display_name=res)


@app.get(
    path="/trips/dest_stop_id",
    summary="運行IDを持つバスの終着駅のIDを取得する",
    description="運行IDが見つからない場合はエラーを返す",
    responses={400: {"description": "運行IDに対応する経路IDが見つからない場合"}},
)
async def get_destination_id_from_trip(trip_id: TripIdQuery) -> TripAndDestStopId:
    try:
        res = wf.get_destination_id_from_trip(trip_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return TripAndDestStopId(trip_id=trip_id, destination_stop_id=res)


@app.get(
    path="/trips/name",
    summary="運行IDを持つ路線の短縮名を取得する",
    description="運行IDが見つからない場合はエラーを返す",
    responses={400: {"description": "運行IDに対応する経路IDが見つからない場合"}},
)
async def get_trip_route_name(trip_id: TripIdQuery) -> TripIdAndRouteName:
    try:
        res = wf.get_route_name_from_route(wf.get_route_id_from_trip(trip_id))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return TripIdAndRouteName(trip_id=trip_id, route_name=res)


@app.get(
    path="/path/search",
    summary="2つのバス停間の最短経路(乗り換え)を取得する",
    description="from と to にはバス停IDを指定する。逆順は受け入れられない場合がある",
    responses={
        400: {"description": "バス停IDが指定されていない、あるいは存在しない場合"}
    },
)
async def get_shortest_path(from_id: StopIdQuery, to_id: StopIdQuery) -> PathResponse:
    if from_id is None:
        raise HTTPException(
            status_code=400,
            detail="Please specify departure bus stop id with ?from={bus stop id}.",
        )
    if to_id is None:
        raise HTTPException(
            status_code=400,
            detail="Please specify arrival bus stop id with ?to={bus stop id}.",
        )
    try:
        path = wf.get_shortest_path(from_id, to_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return PathResponse(path=path)


@app.get(
    path="/path/timed_search",
    summary="曜日や時刻を指定して、2つのバス停間の最短経路(乗り換え)を取得する",
    description="from と to にはバス停IDを指定する。逆順は受け入れられない。service_id は「平日」「土日祝」などの運行種別を入力する。begin_time は最初のバス停の出発時刻を HH:MM:SS の形式で入力する",
    response_model=TimedTravelResponse,
)
async def get_timed_shortest_path(
    from_id: StopIdQuery,
    to_id: StopIdQuery,
    service_id: ServiceIdQuery,
    begin_time: TimeOnlyQuery,
) -> TimedTravelResponse:
    try:
        path = wf.get_shortest_path(from_id, to_id)
        if len(path) == 0:
            raise HTTPException(
                status_code=400,
                detail="No path from " + from_id + " to " + to_id + " found.",
            )
        try:
            time_split = begin_time.split(":")
            time_str = (
                wf.default_date
                + "T"
                + str.zfill(time_split[0], 2)
                + ":"
                + str.zfill(time_split[1], 2)
                + ":"
                + str.zfill(time_split[2], 2)
            )
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid time format: "
                + begin_time
                + ". Please use HH:MM:SS format.",
            )
        begin_time_np = np.datetime64(time_str)
        travels = wf.get_timed_travels_from_path(path, service_id, begin_time_np)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except networkx.NetworkXNoPath:
        raise HTTPException(
            status_code=400,
            detail="No path from " + from_id + " to " + to_id + " found.",
        )
    return TimedTravelResponse(
        travels=[travel_once_to_travel_once_response(travel) for travel in travels]
    )


@app.get(
    path="/trips/passing",
    summary="ある運行IDのバスが指定されたバス停IDにいつ着いて、いつ出発するか取得する",
    description="バス停のIDや運行IDが見つからない場合はエラーを返す",
    responses={400: {"description": "運行IDやバス停が見つからない場合"}},
)
async def get_trip_passing_times(trip_id: TripIdQuery, stop_id: StopIdQuery):
    try:
        res = wf.get_time_from_trip_and_stop(trip_id, stop_id)
        return {
            "trip_id": trip_id,
            "stop_id": stop_id,
            "arrival_time": wf.np_datetime_truncate_to_str(res["arrival_time"]),
            "departure_time": wf.np_datetime_truncate_to_str(res["departure_time"]),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, log_level="info")
