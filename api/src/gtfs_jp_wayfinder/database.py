import logging
import warnings
from dataclasses import dataclass
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import networkx as nx
import numpy as np
import pandas as pd

from gtfs_jp_wayfinder.utils.distance import (
    DistanceCalculator,
    EuclideanDistanceCalculator,
    HaversineDistanceCalculator,
)

logger = logging.getLogger(__name__)


@dataclass
class TravelOnce:
    trip_id: str | list[str]
    fare: int
    arrival_time: np.datetime64 | None
    departure_time: np.datetime64 | None
    from_stop_id: str
    to_stop_id: str


@dataclass
class NearbyStopResult:
    """Result for a single nearby bus stop."""

    stop_id: str
    stop_name: str
    distance_km: float
    stop_lat: float
    stop_lon: float


class AkitaBusWayFinder:
    def __init__(self, use_haversine: bool = True):
        self.df_stops = None
        self.df_stop_times = None
        self.df_fare_id_route = None
        self.df_fare_id_cost = None
        self.df_trips = None
        self.df_routes = None
        self.date_to_service_id = None
        self.graph = None
        self.graph_via_service_id = dict()
        self.default_date = "2021-01-01"
        self.agency_timezone = "UTC"

        # Performance optimization: Lookup indices built during initialize()
        # These caches trade memory for significant query speedup in route search
        self._trip_to_service_id: dict[str, str] = {}  # trip_id -> service_id
        self._stop_to_trips: dict[str, list[str]] = {}  # stop_id -> [trip_ids]
        self._trip_stop_times: dict[
            tuple[str, str], tuple[np.datetime64, np.datetime64, int]
        ] = {}  # (trip_id, stop_id) -> (arrival_time, departure_time, stop_sequence)

        # Distance calculator - can be switched between Haversine and Euclidean
        self.distance_calculator: DistanceCalculator = (
            HaversineDistanceCalculator()
            if use_haversine
            else EuclideanDistanceCalculator()
        )

    # 文字列の時刻情報を numpy の datetime64 に変換する
    # 簡便な比較用のため日付を default_date にしているが無意味なので注意
    def time_str_to_np_datetime(self, time_str) -> np.datetime64:
        return np.datetime64(self.default_date + "T" + time_str)

    # Numpy の datetime64 を日付とミリ秒情報を捨てて、文字列に変換する
    # バスロケの時刻情報へ変換できる
    def np_datetime_truncate_to_str(self, np_datetime: np.datetime64) -> str:
        # 日付を捨てる
        date_and_time_split = str(np_datetime).split("T")
        if len(date_and_time_split) > 1:
            time_only = date_and_time_split[1]
        else:
            date_and_time_space_split = str(np_datetime).split(" ")
            # Tじゃない場合があるらしい
            time_only = date_and_time_space_split[1]

        # ミリ秒を捨てる
        time_only_dot_split = time_only.split(".")
        if len(time_only_dot_split) > 0:
            return time_only_dot_split[0]
        return time_only

    def initialize(self, base_dir="../data/"):
        logger.info("Loading dataframes...")
        # Agency info (timezone, etc.)
        # Try to read agency_timezone from GTFS data; fall back to Asia/Tokyo, then UTC
        try:
            agency_df = pd.read_csv(base_dir + "agency.txt")
            if "agency_timezone" in agency_df.columns and not agency_df.empty:
                tz_value = str(agency_df.iloc[0]["agency_timezone"])
                if tz_value:
                    try:
                        ZoneInfo(tz_value)  # Validate it's a valid IANA timezone
                        self.agency_timezone = tz_value
                    except ZoneInfoNotFoundError:
                        logger.warning(
                            "Invalid timezone in agency.txt: %s; falling back to Asia/Tokyo, then UTC.",
                            tz_value,
                        )
        except FileNotFoundError as err:
            raise FileNotFoundError(
                "Required txt file for GTFS-JP agency.txt is not found!"
            ) from err
        except Exception as exc:
            logger.warning(
                "Failed to read agency.txt (%s); using default timezone Asia/Tokyo.",
                exc,
            )
        # At this point, timezone is either from agency.txt, or the default "UTC" from __init__
        # Try Asia/Tokyo as fallback for GTFS-JP data if still using UTC
        if self.agency_timezone == "UTC":
            try:
                ZoneInfo("Asia/Tokyo")  # Validate Asia/Tokyo is available
                logger.info("Using Asia/Tokyo as fallback timezone for GTFS-JP data.")
                self.agency_timezone = "Asia/Tokyo"
            except ZoneInfoNotFoundError:
                logger.warning(
                    "Asia/Tokyo timezone not available; keeping UTC as fallback."
                )
        # バス停
        self.df_stops = pd.read_csv(base_dir + "stops.txt")
        # バス停の時刻、通過時刻と経路
        self.df_stop_times = pd.read_csv(
            base_dir + "stop_times.txt",
            converters={
                "arrival_time": self.time_str_to_np_datetime,
                "departure_time": self.time_str_to_np_datetime,
            },
        )
        # バス停どうしの料金IDと経路
        self.df_fare_id_route = pd.read_csv(base_dir + "fare_rules.txt")
        # バス停どうしの料金IDと料金
        self.df_fare_id_cost = pd.read_csv(base_dir + "fare_attributes.txt")
        # trip 関連
        self.df_trips = pd.read_csv(base_dir + "trips.txt")
        # route の short_name 関連
        self.df_routes = pd.read_csv(base_dir + "routes.txt")
        # 日付から service id に変換
        self.date_to_service_id = None

        logger.info("Building lookup indices for performance...")
        self._build_lookup_indices()

        logger.info("Generating Calendar...")
        self.generate_calendar(base_dir)

        logger.info("Generating Stops graph...")
        self.generate_graph()

        logger.info("Preparation completed!")

    def _build_lookup_indices(self):
        """Build lookup indices for faster query performance.

        This method creates in-memory dictionaries that trade memory for
        significant speed improvements in route search operations.
        """
        # Build trip_id -> service_id lookup (used by get_trip_service_id)
        self._trip_to_service_id = dict(
            zip(
                self.df_trips["trip_id"],
                self.df_trips["service_id"],
                strict=True,
            )
        )
        logger.info(
            "Built trip->service_id index with %d entries",
            len(self._trip_to_service_id),
        )

        # Build stop_id -> [trip_ids] lookup (used by get_trips_from_stops)
        self._stop_to_trips = {}
        for stop_id, trip_id in zip(
            self.df_stop_times["stop_id"],
            self.df_stop_times["trip_id"],
            strict=True,
        ):
            if stop_id not in self._stop_to_trips:
                self._stop_to_trips[stop_id] = []
            if trip_id not in self._stop_to_trips[stop_id]:
                self._stop_to_trips[stop_id].append(trip_id)
        logger.info(
            "Built stop->trips index with %d stops",
            len(self._stop_to_trips),
        )

        # Build (trip_id, stop_id) -> (arrival_time, departure_time, stop_sequence) lookup
        # Used by get_trip_times and get_trips_from_stops for faster sequence lookups
        self._trip_stop_times = {}
        for _, row in self.df_stop_times.iterrows():
            key = (row["trip_id"], row["stop_id"])
            self._trip_stop_times[key] = (
                row["arrival_time"],
                row["departure_time"],
                row["stop_sequence"],
            )
        logger.info(
            "Built (trip,stop)->times index with %d entries",
            len(self._trip_stop_times),
        )

    def generate_graph(self):
        def generate_edges_from_grouped_trips(grouped_df):
            """Generate edges from pre-grouped DataFrame (more efficient than per-trip lookups)."""
            edges = []
            for _trip_id, df_trip in grouped_df:
                df_trip = df_trip.sort_values(by=["stop_sequence"])
                stop_ids = df_trip["stop_id"].values
                stop_ids_count = len(stop_ids)

                # 自己ループを除いてすべてつなげる
                edges.extend(
                    [
                        (stop_ids[i], stop_ids[j])
                        for i in range(stop_ids_count)
                        for j in range(i + 1, stop_ids_count)
                    ],
                )
            return edges

        logger.info("Generating merged graph...")
        self.graph = nx.DiGraph()

        # Use groupby for single-pass iteration instead of per-trip DataFrame filters
        all_trips_grouped = self.df_stop_times.groupby("trip_id")
        all_edges = generate_edges_from_grouped_trips(all_trips_grouped)
        self.graph.add_edges_from(all_edges)

        logger.info("Generating graphs for each service_id...")
        self.graph_via_service_id = dict()

        # Pre-compute service_id -> trip_ids mapping for efficient filtering
        service_to_trips = {}
        for service_id in self.df_trips["service_id"].value_counts().index:
            service_to_trips[service_id] = set(
                self.df_trips[self.df_trips["service_id"] == service_id]["trip_id"]
            )

        for service_id, trip_ids_set in service_to_trips.items():
            logger.info("Generating graph for service_id: %s", service_id)
            self.graph_via_service_id[service_id] = nx.DiGraph()

            # Filter grouped trips by service_id
            service_edges = []
            for trip_id, df_trip in all_trips_grouped:
                if trip_id not in trip_ids_set:
                    continue
                df_trip = df_trip.sort_values(by=["stop_sequence"])
                stop_ids = df_trip["stop_id"].values
                stop_ids_count = len(stop_ids)

                service_edges.extend(
                    [
                        (stop_ids[i], stop_ids[j])
                        for i in range(stop_ids_count)
                        for j in range(i + 1, stop_ids_count)
                    ],
                )
            self.graph_via_service_id[service_id].add_edges_from(service_edges)

    def generate_calendar(self, base_dir):
        df_base_calendar = pd.read_csv(base_dir + "calendar.txt")
        df_calendar_dates = pd.read_csv(base_dir + "calendar_dates.txt")

        date_to_service_id_list = dict()

        for _, override_row in df_base_calendar.iterrows():
            service_id = override_row["service_id"]
            start_date = override_row["start_date"]
            end_date = override_row["end_date"]
            for date in pd.date_range(str(start_date), str(end_date)):
                date_format = date.strftime("%Y%m%d")
                if date_format not in date_to_service_id_list:
                    date_to_service_id_list[date_format] = []  # 初期化する
                # 曜日と合致すれば追加する
                if (
                    (date.weekday() == 0 and override_row["monday"] == 1)
                    or (date.weekday() == 1 and override_row["tuesday"] == 1)
                    or (date.weekday() == 2 and override_row["wednesday"] == 1)
                    or (date.weekday() == 3 and override_row["thursday"] == 1)
                    or (date.weekday() == 4 and override_row["friday"] == 1)
                    or (date.weekday() == 5 and override_row["saturday"] == 1)
                    or (date.weekday() == 6 and override_row["sunday"] == 1)
                ):
                    date_to_service_id_list[date_format].append(service_id)

        # override する
        for _, override_row in df_calendar_dates.iterrows():
            date = str(override_row["date"])
            service_id = override_row["service_id"]
            exception_type = override_row["exception_type"]
            if exception_type == 2:  # 「削除」のクエリだと考える
                if date in date_to_service_id_list:
                    if service_id in date_to_service_id_list[date]:
                        date_to_service_id_list[date].remove(service_id)
                    else:
                        warnings.warn(
                            "While trying to override service id from calendar_dates.txt, the service_id "
                            + str(service_id)
                            + "was not found in the date "
                            + str(date)
                            + "in calendar_dates.txt! This will be ignored.",
                            stacklevel=2,
                        )
                else:
                    warnings.warn(
                        "While trying to override service id from calendar_dates.txt, the date "
                        + str(date)
                        + " was not found in regular dates (calendar.txt)! Check calendar_dates.txt corresponds with calendar.txt. This will be ignored.",
                        stacklevel=2,
                    )
            elif exception_type == 1:  # 「追加」のクエリだと考える
                # if date in date_to_service_id_list:
                #     warnings.warn(
                #         "Duplicate date " +
                #         str(date) +
                #         "was found while reading calendar_dates.txt! Only the last one will be used."
                #     )
                date_to_service_id_list[date].append(service_id)
            else:
                warnings.warn(
                    "The date "
                    + str(date)
                    + " in calendar_dates.txt contains invalid exception_type"
                    + str(exception_type)
                    + " ! This will be ignored.",
                    stacklevel=2,
                )

        self.date_to_service_id = date_to_service_id_list

    # バス停idからバスの名前を取得する
    # 何もないときはNone、存在すればそれらを list で返す
    #   None | str | numpy.ndarray
    def get_stop_name(self, stop_id: str):
        ret = self.df_stops[self.df_stops["stop_id"] == stop_id]["stop_name"].values
        # numpy.ndarray 型
        if ret.shape[0] == 0:
            return None
        return list(ret)

    # バス停idからplatform_codeを取得する
    # 何もないときはNone、存在すればその値を文字列で返す
    def get_platform_code(self, stop_id: str):
        ret = self.df_stops[self.df_stops["stop_id"] == stop_id]["platform_code"].values
        # numpy.ndarray 型
        if ret.shape[0] == 0:
            raise KeyError("stop_id not found")
        # platform_code is optional in GTFS spec, might be NaN or empty string
        platform_code = ret[0]
        # Handle pandas NaN values and empty strings
        if pd.isna(platform_code) or platform_code == "":
            return None
        # If already a string, return as-is; if numeric, convert to int first to remove .0 from floats
        if isinstance(platform_code, str):
            return platform_code
        try:
            # may be comprehended as float, so convert to int first
            return str(int(platform_code))
        except (ValueError, TypeError):
            return str(platform_code)

    # バス停の名前からidに変換する
    #   None | DataFrame[{ "stop_id": str, "stop_name": str }]
    def get_stop_id(self, stop_name, exact=False):
        if exact:
            ret = self.df_stops[self.df_stops["stop_name"] == stop_name][
                ["stop_id", "stop_name"]
            ]
        else:
            ret = self.df_stops[self.df_stops["stop_name"].str.contains(stop_name)][
                ["stop_id", "stop_name"]
            ]
        return ret

    # 2つをつなぐ路線IDのリストを取得
    # 修正: from -> to の順番でなければ受け付けない
    def get_trips_from_stops(self, from_id, to_id, service_id=None):
        res = []

        # Use pre-built stop->trips index for O(1) lookup instead of DataFrame filter
        if from_id in self._stop_to_trips:
            candidates = self._stop_to_trips[from_id]
        else:
            # Fallback to DataFrame if cache miss
            candidates = list(
                self.df_stop_times[self.df_stop_times["stop_id"] == from_id][
                    "trip_id"
                ].values
            )

        # Filter by service_id using cached lookup
        if service_id is not None:
            candidates = [
                x for x in candidates if self.get_trip_service_id(x) == service_id
            ]

        for trip_id in candidates:
            # Use pre-built (trip_id, stop_id) -> times index for O(1) lookup
            from_key = (trip_id, from_id)
            to_key = (trip_id, to_id)

            # Check if trip stops at both from and to stops
            if from_key not in self._trip_stop_times:
                continue
            if to_key not in self._trip_stop_times:
                continue

            from_seq = self._trip_stop_times[from_key][2]  # stop_sequence is index 2
            to_seq = self._trip_stop_times[to_key][2]

            # Verify to_stop comes after from_stop in sequence
            if to_seq > from_seq:
                res.append(trip_id)

        return res

    # ある路線を通じた出発、到着時間を取得
    # 注意！ trip_id は from -> to の順番で指定しないと、departure と arrival の順番が逆になることもある
    #   戻り値: tuple: (departure, arrival)
    #   07.25 修正: 逆の順番は受け付けない
    def get_trip_times(self, from_id, to_id, trip_id):
        # Use pre-built index for O(1) lookup instead of DataFrame filters
        from_key = (trip_id, from_id)
        to_key = (trip_id, to_id)

        # Check if trip exists (validate trip_id)
        if (
            trip_id not in self._trip_to_service_id
            and self.df_stop_times[self.df_stop_times["trip_id"] == trip_id].shape[0]
            == 0
        ):
            raise ValueError("trip_id not found")

        # Get departure time and sequence from cache
        if from_key not in self._trip_stop_times:
            raise ValueError(
                "The trip " + trip_id + " does not involve a stop: " + from_id,
            )
        _from_arr_time, dep_time, dep_stop_seq = self._trip_stop_times[from_key]

        # Get arrival time from cache
        if to_key not in self._trip_stop_times:
            raise ValueError("The trip " + trip_id + " does not stop at: " + to_id)

        arr_time, _to_dep_time, to_stop_seq = self._trip_stop_times[to_key]

        # Verify sequence order
        if to_stop_seq <= dep_stop_seq:
            raise ValueError(
                "The trip "
                + trip_id
                + " does not stop at "
                + to_id
                + " after the stop "
                + from_id,
            )

        return dep_time, arr_time

    # バス停の緯度経度を取得する
    def get_stop_lat_lon(self, stop_id):
        res = self.df_stops[self.df_stops["stop_id"] == stop_id][
            ["stop_lat", "stop_lon"]
        ]
        if res.shape[0] == 0:
            raise ValueError("stop_id not found")
        if res.shape[0] > 1:
            raise ValueError("stop_id is not unique")

        return res.values[0]

    # あるバス停間の route_id と fare id を取得する
    # 複数返る場合もある
    def get_fare_route_by_stops(self, from_id, to_id):
        fares_df = self.df_fare_id_route[
            (self.df_fare_id_route["origin_id"] == from_id)
            & (self.df_fare_id_route["destination_id"] == to_id)
        ][["route_id", "fare_id"]]
        if fares_df.shape[0] == 0:
            # 逆も試す
            fares_df = self.df_fare_id_route[
                (self.df_fare_id_route["origin_id"] == to_id)
                & (self.df_fare_id_route["destination_id"] == from_id)
            ][["route_id", "fare_id"]]
            if fares_df.shape[0] == 0:
                raise ValueError("origin or destination not found")
        #        if fares_df.shape[0] > 1:
        #            raise ValueError("origin and destination are not unique")

        return fares_df

    # fare id から 運賃を取得する
    def get_fare_from_id(self, fare_id):
        return self.df_fare_id_cost[self.df_fare_id_cost["fare_id"] == fare_id][
            "price"
        ].values[0]

    # あるバス停間の運賃を取得する
    def get_fare_from_stops(self, from_id, to_id) -> int:
        route_and_fares = self.get_fare_route_by_stops(from_id, to_id)
        return self.get_fare_from_id(route_and_fares["fare_id"].values[0]).item()

    # 経路を検索する ("乗り換えるべきバス停" が出る)
    # NetworkXNoPath: 経路が見つからない場合

    def get_shortest_path(self, from_id, to_id, service_id=None):
        if service_id is None:
            path = nx.shortest_path(self.graph, source=from_id, target=to_id)
        else:
            path = nx.shortest_path(
                self.graph_via_service_id[service_id],
                source=from_id,
                target=to_id,
            )

        return path

    # path (バス停IDのlist) から、それらを通るすべての経路IDを取得する
    # trip_id はlistになることに注意
    def get_travels_from_path(self, path, service_id=None) -> list[TravelOnce]:
        prev_stop = None
        travel_list = []

        for current_stop in path:
            if prev_stop is None:
                prev_stop = current_stop
                continue
            # find trips that go from the previous stop to the current stop
            trips = self.get_trips_from_stops(prev_stop, current_stop, service_id)
            travel_list.append(
                TravelOnce(
                    trip_id=trips,
                    fare=self.get_fare_from_stops(prev_stop, current_stop),
                    arrival_time=None,
                    departure_time=None,
                    from_stop_id=prev_stop,
                    to_stop_id=current_stop,
                ),
            )
            prev_stop = current_stop

        return travel_list

    # path (バス停IDのlist) と service_id, begin_time から、それらを通るすべての経路IDを取得する
    # begin_time 以降で最速のひとつのみが trip_id として入る
    # 注意: 日を越すことはできない
    def get_timed_travels_from_path(
        self,
        path: list[str],
        service_id: str,
        begin_time: np.datetime64,
        change_time: np.timedelta64 | None = None,
    ) -> list[TravelOnce]:
        if change_time is None:
            change_time = np.timedelta64(0, "m")

        # Validate that begin_time is not None
        if begin_time is None:
            raise ValueError("begin_time cannot be None")

        cur_time = begin_time
        prev_stop = None
        travel_list = []

        for current_stop in path:
            if prev_stop is None:
                prev_stop = current_stop
                continue
            candidate_trips = dict()
            logger.info("@ %s %s -> %s", cur_time, prev_stop, current_stop)

            # Validate that cur_time is not None before using it
            # This should never happen as begin_time is validated and arr_time is validated
            # but we check defensively to prevent TypeError
            if cur_time is None:
                logger.error(
                    "Current time is None at stop %s - this indicates a data integrity issue",
                    prev_stop,
                )
                raise ValueError(
                    f"Unexpected None value for current time at stop {prev_stop}. "
                    "This may indicate data corruption in the GTFS data."
                )

            for target_trip in self.get_trips_from_stops(
                prev_stop,
                current_stop,
                service_id,
            ):
                dep_time, arr_time = self.get_trip_times(
                    prev_stop,
                    current_stop,
                    target_trip,
                )
                if dep_time >= cur_time + change_time:
                    candidate_trips[target_trip] = arr_time
            if len(candidate_trips.keys()) == 0:
                # Return empty list instead of raising error when no trips are available
                logger.info(
                    "No trip found with departure time after %s at stop %s to stop %s",
                    cur_time,
                    prev_stop,
                    current_stop,
                )
                return []
            fastest_trip = min(candidate_trips, key=candidate_trips.get)
            dep_time, arr_time = self.get_trip_times(
                prev_stop,
                current_stop,
                fastest_trip,
            )
            logger.info(
                "fastest via %s dep %s arr %s",
                fastest_trip,
                dep_time,
                arr_time,
            )

            # Validate that arr_time is not None before using it
            # If arr_time is None, this is a fatal data integrity error
            if arr_time is None:
                logger.error(
                    "Arrival time is None for trip %s - this indicates invalid GTFS data",
                    fastest_trip,
                )
                raise ValueError(
                    f"Arrival time is None for trip {fastest_trip} at stop {current_stop}. "
                    "This indicates invalid or corrupted GTFS data and the request cannot be fulfilled."
                )

            travel_list.append(
                TravelOnce(
                    trip_id=fastest_trip,
                    arrival_time=arr_time,
                    departure_time=dep_time,
                    fare=self.get_fare_from_stops(prev_stop, current_stop),
                    from_stop_id=prev_stop,
                    to_stop_id=current_stop,
                ),
            )
            cur_time = arr_time
            prev_stop = current_stop
        return travel_list

    # あるバス停を通るすべての trip を取得する
    #   service_id を指定するとフィルタリングが可能
    #   --> list
    def get_trips_from_stop(self, stop_id, service_id=None):
        trips_filtered = self.df_stop_times[self.df_stop_times["stop_id"] == stop_id][
            "trip_id"
        ]
        if service_id is None:
            res = list(trips_filtered)
        else:
            res = []
            for row in trips_filtered:
                if self.get_trip_service_id(row) == service_id:
                    res.append(row)
        if len(res) == 0:
            raise ValueError("no stop with given id found")
        return res

    # trip が stop_id と合致するバス停を通る時間を取得する
    #   --> dict{"trip_id": str, "arrival_time": str, "departure_time": str}
    def get_time_from_trip_and_stop(self, trip_id, stop_id):
        res = self.df_stop_times[
            (self.df_stop_times["trip_id"] == trip_id)
            & (self.df_stop_times["stop_id"] == stop_id)
        ][["trip_id", "arrival_time", "departure_time"]]

        if res.shape[0] == 0:
            trip_res = self.df_stop_times[self.df_stop_times["trip_id"] == trip_id]
            stop_res = self.df_stop_times[self.df_stop_times["stop_id"] == stop_id]
            if trip_res.shape[0] == 0:
                if stop_res.shape[0] == 0:
                    raise ValueError(
                        "No trip with given trip_id found and no stop with give stop_id found",
                    )
                raise ValueError(
                    "A stop with given stop_id was found, but no trip with given trip_id found",
                )
            if stop_res.shape[0] == 0:
                raise ValueError(
                    "A trip with given trip_id was found, but no stop with given stop_id found",
                )
            raise ValueError(
                "Given valid trip_id and stop_id, but no trip with the specified combination found",
            )
        return {
            "trip_id": res["trip_id"].values[0],
            "arrival_time": res["arrival_time"].values[0],
            "departure_time": res["departure_time"].values[0],
        }

    # trip と stop_id からその trip のゆくバス停について、それらへの運賃や到着時間を取得する
    # TODO: 要命名
    def get_trip_journey(self, trip_id, from_stop_id) -> pd.DataFrame:
        trip_stops = self.get_stops_from_trip(trip_id)["stop_id"]
        stops_list = []
        fare_list = []
        arrival_time_list = []
        departure_time_list = []

        for dest_stop_id in trip_stops:
            if dest_stop_id == from_stop_id:
                fare = 0  # 同じバス停なら0円
            else:
                fare = self.get_fare_from_stops(from_stop_id, dest_stop_id)
            time_df = self.get_time_from_trip_and_stop(trip_id, dest_stop_id)
            arrival_time = time_df["arrival_time"]
            departure_time = time_df["departure_time"]
            stops_list.append(dest_stop_id)
            fare_list.append(fare)
            arrival_time_list.append(arrival_time)
            departure_time_list.append(departure_time)

        return pd.DataFrame(
            {
                "trip_id": trip_id,
                "fare": fare_list,
                "arrival_time": arrival_time_list,
                "departure_time": departure_time_list,
                "stop_id": stops_list,
            },
        )

    # trip_id から service_id を得る
    def get_trip_service_id(self, trip_id):
        # Use pre-built cache for O(1) lookup instead of DataFrame filter
        if trip_id in self._trip_to_service_id:
            return self._trip_to_service_id[trip_id]
        # Fallback to DataFrame lookup if cache miss (shouldn't happen after initialize)
        sid_series = self.df_trips[self.df_trips["trip_id"] == trip_id]["service_id"]
        if sid_series.shape[0] == 0:
            raise ValueError("No trip with given trip_id found")
        return sid_series.values[0]

    # trip_id の止まるすべてのバス停と時刻、順番を取得
    def get_stops_from_trip(self, trip_id):
        res = self.df_stop_times[self.df_stop_times["trip_id"] == trip_id][
            [
                "trip_id",
                "arrival_time",
                "departure_time",
                "stop_id",
                "stop_sequence",
                "stop_headsign",
            ]
        ]
        if res.shape[0] == 0:
            raise ValueError("No trip with given trip_id found")
        return res

    # trip の終着駅のidを取得 (注意: 行き先表示板ではない！)
    def get_destination_id_from_trip(self, trip_id) -> str:
        df_stop = self.get_stops_from_trip(trip_id)
        max_seq = max(df_stop["stop_sequence"].values.tolist())
        # return the stop_id for the row with the maximum sequence
        res = df_stop[df_stop["stop_sequence"] == max_seq]["stop_id"].values[0]
        return str(res)

    # route_id に関連する情報をぜんぶ取得する
    def get_route_info(self, route_id):
        df_matching_trips = self.df_trips[self.df_trips["route_id"] == route_id]
        if df_matching_trips.shape[0] == 0:
            raise ValueError("No trip with given trip_id found")
        return df_matching_trips

    # trip_id から route_id に変換 (注意: 上り下りなどのサフィックスを消去しない)
    def get_route_id_from_trip(self, trip_id):
        df_matching_trips = self.df_trips[self.df_trips["trip_id"] == trip_id]
        if df_matching_trips.shape[0] == 0:
            raise ValueError("No trip with given trip_id found")
        return df_matching_trips["route_id"].values[0]

    # route_id の行き先を取得 (注意: バス停の名前ではない！)
    def get_destination_display_name_from_route(self, route_id):
        df_matching_routes = self.get_route_info(route_id)
        if df_matching_routes.shape[0] == 0:
            raise ValueError("No route with give route_id found")
        return df_matching_routes["trip_headsign"].values[0]

    # route_id に対応する service id を取得
    def get_service_id_from_route(self, route_id):
        return self.get_route_info(route_id)["service_id"].values[0]

    # route_id に対応する短縮名(「なんとか線」を取得)
    def get_route_name_from_route(self, route_id):
        return self.df_routes[self.df_routes["route_id"] == route_id][
            "route_long_name"
        ].values[0]

    def get_nearby_stops(
        self,
        lat: float,
        lon: float,
        limit: int = 10,
    ) -> list[NearbyStopResult]:
        """Get nearby bus stops sorted by distance from given coordinates.

        Args:
            lat: Latitude in decimal degrees
            lon: Longitude in decimal degrees
            limit: Maximum number of stops to return (default: 10)

        Returns:
            List of NearbyStopResult dataclasses sorted by distance from nearest to farthest
        """
        if limit <= 0:
            raise ValueError("limit must be positive")
        # Use batch calculation for better performance with large datasets
        distances = self.distance_calculator.calculate_distances_batch(
            lat,
            lon,
            self.df_stops,
        )
        # Extract data as numpy arrays for better performance than iterrows()
        stop_ids = self.df_stops["stop_id"].values
        stop_names = self.df_stops[
            "stop_name"
        ].values  # stop_name is required in GTFS spec
        stop_lats = self.df_stops["stop_lat"].values.astype(float)
        stop_lons = self.df_stops["stop_lon"].values.astype(float)
        # Create result objects using array indexing
        results = [
            NearbyStopResult(
                stop_id=stop_ids[i],
                stop_name=stop_names[i],
                distance_km=distances[i],
                stop_lat=stop_lats[i],
                stop_lon=stop_lons[i],
            )
            for i in range(len(distances))
        ]
        # Sort by distance and return only the requested limit
        results.sort(key=lambda x: x.distance_km)
        return results[:limit]
