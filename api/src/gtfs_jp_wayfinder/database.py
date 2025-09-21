import logging
import warnings

import networkx as nx
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class TravelOnce:
    def __init__(
        self,
        trip_id,
        fare,
        arrival_time: np.datetime64 | None,
        departure_time: np.datetime64 | None,
        from_stop_id,
        to_stop_id,
    ):
        self.trip_id = trip_id
        self.fare = fare
        self.arrival_time = arrival_time
        self.departure_time = departure_time
        self.from_stop_id = from_stop_id
        self.to_stop_id = to_stop_id


class AkitaBusWayFinder:
    def __init__(self):
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

        logger.info("Generating Calendar...")
        self.generate_calendar(base_dir)

        logger.info("Generating Stops graph...")
        self.generate_graph()

        logger.info("Preparation completed!")

    def generate_graph(self):
        def generate_edges_from_trips(trip_ids, get_trip_df):
            edges = []
            for trip in trip_ids:
                df_trip = get_trip_df(trip)
                df_trip = df_trip.sort_values(by=["stop_sequence"])
                stop_ids = df_trip["stop_id"].values
                stop_ids_count = len(stop_ids)

                # 自己ループを除いてすべてつなげる
                edges.extend(
                    [
                        (stop_ids[i], stop_ids[j])
                        for i in range(stop_ids_count)
                        for j in range(i + 1, stop_ids_count)
                    ]
                )
            return edges

        logger.info("Generating merged graph...")
        self.graph = nx.DiGraph()

        all_trip_ids = list(self.df_stop_times["trip_id"].value_counts().index)
        all_edges = generate_edges_from_trips(
            all_trip_ids,
            lambda trip: self.df_stop_times[self.df_stop_times["trip_id"] == trip],
        )
        self.graph.add_edges_from(all_edges)

        logger.info("Generating graphs for each service_id...")
        self.graph_via_service_id = dict()

        for service_id in self.df_trips["service_id"].value_counts().index:
            logger.info("Generating graph for service_id: %s", service_id)
            self.graph_via_service_id[service_id] = nx.DiGraph()

            service_trip_ids = list(
                self.df_trips[self.df_trips["service_id"] == service_id]["trip_id"]
            )
            service_edges = generate_edges_from_trips(
                service_trip_ids,
                lambda trip: self.df_stop_times[self.df_stop_times["trip_id"] == trip],
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
                            + "in calendar_dates.txt! This will be ignored."
                        )
                else:
                    warnings.warn(
                        "While trying to override service id from calendar_dates.txt, the date "
                        + str(date)
                        + " was not found in regular dates (calendar.txt)! Check calendar_dates.txt corresponds with calendar.txt. This will be ignored."
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
                    + " ! This will be ignored."
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
        if service_id is None:
            candidates = self.df_stop_times[self.df_stop_times["stop_id"] == from_id][
                "trip_id"
            ].values
        else:
            candidates = self.df_stop_times[(self.df_stop_times["stop_id"] == from_id)][
                "trip_id"
            ].values
            candidates = [
                x for x in candidates if self.get_trip_service_id(x) == service_id
            ]
        for trip_id in candidates:
            from_seq = self.df_stop_times[
                (self.df_stop_times["trip_id"] == trip_id)
                & (self.df_stop_times["stop_id"] == from_id)
            ]["stop_sequence"].values[0]
            if (
                self.df_stop_times[
                    (self.df_stop_times["trip_id"] == trip_id)
                    & (self.df_stop_times["stop_id"] == to_id)
                    & (self.df_stop_times["stop_sequence"] > from_seq)
                ].shape[0]
                > 0
            ):
                res.append(trip_id)
        #            if self.df_stop_times[self.df_stop_times["trip_id"] == trip_id]["stop_id"].isin([to_id]).any():
        #                res.append(trip_id)
        return res

    # ある路線を通じた出発、到着時間を取得
    # 注意！ trip_id は from -> to の順番で指定しないと、departure と arrival の順番が逆になることもある
    #   戻り値: tuple: (departure, arrival)
    #   07.25 修正: 逆の順番は受け付けない
    def get_trip_times(self, from_id, to_id, trip_id):
        if self.df_stop_times[self.df_stop_times["trip_id"] == trip_id].shape[0] == 0:
            raise ValueError("trip_id not found")

        dep_time_df = self.df_stop_times[
            (self.df_stop_times["trip_id"] == trip_id)
            & (self.df_stop_times["stop_id"] == from_id)
        ][["departure_time", "stop_sequence"]]
        if dep_time_df.shape[0] == 0:
            raise ValueError(
                "The trip " + trip_id + " does not involve a stop: " + from_id
            )
        dep_time = dep_time_df["departure_time"].values[0]
        dep_stop_seq = dep_time_df["stop_sequence"].values[0]

        arr_time = self.df_stop_times[
            (self.df_stop_times["trip_id"] == trip_id)
            & (self.df_stop_times["stop_id"] == to_id)
            & (self.df_stop_times["stop_sequence"] > dep_stop_seq)
        ]["arrival_time"].values
        if arr_time.shape[0] == 0:
            # 変更のためではあるが、sequence を無視したかを判断する
            arr_seqless_df = self.df_stop_times[
                (self.df_stop_times["trip_id"] == trip_id)
                & (self.df_stop_times["stop_id"] == to_id)
            ]
            if arr_seqless_df.shape[0] == 0:
                raise ValueError("The trip " + trip_id + " does not stop at: " + to_id)
            raise ValueError(
                "The trip "
                + trip_id
                + " does not stop at "
                + to_id
                + " after the stop "
                + from_id
            )
        arr_time = arr_time[0]

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
                self.graph_via_service_id[service_id], source=from_id, target=to_id
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
            trips = self.get_trips_from_stops(current_stop, current_stop, service_id)
            travel_list.append(
                TravelOnce(
                    trip_id=trips,
                    fare=self.get_fare_from_stops(prev_stop, current_stop),
                    arrival_time=None,
                    departure_time=None,
                    from_stop_id=prev_stop,
                    to_stop_id=current_stop,
                )
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
        change_time: np.timedelta64 = np.timedelta64(0, "m"),
    ) -> list[TravelOnce]:
        cur_time = begin_time
        prev_stop = None
        travel_list = []

        for current_stop in path:
            if prev_stop is None:
                prev_stop = current_stop
                continue
            candidate_trips = dict()
            logger.info("@ %s %s -> %s", cur_time, prev_stop, current_stop)
            for target_trip in self.get_trips_from_stops(
                prev_stop, current_stop, service_id
            ):
                dep_time, arr_time = self.get_trip_times(
                    prev_stop, current_stop, target_trip
                )
                if dep_time >= cur_time + change_time:
                    candidate_trips[target_trip] = arr_time
            if len(candidate_trips.keys()) == 0:
                raise ValueError(
                    "No trip found with departure time after the current time "
                    + str(cur_time)
                    + " at stop "
                    + prev_stop
                    + " to stop "
                    + current_stop
                )
            fastest_trip = min(candidate_trips, key=candidate_trips.get)
            dep_time, arr_time = self.get_trip_times(
                prev_stop, current_stop, fastest_trip
            )
            logger.info(
                "fastest via %s dep %s arr %s", fastest_trip, dep_time, arr_time
            )

            travel_list.append(
                TravelOnce(
                    trip_id=fastest_trip,
                    arrival_time=arr_time,
                    departure_time=dep_time,
                    fare=self.get_fare_from_stops(prev_stop, current_stop),
                    from_stop_id=prev_stop,
                    to_stop_id=current_stop,
                )
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
                        "No trip with given trip_id found and no stop with give stop_id found"
                    )
                raise ValueError(
                    "A stop with given stop_id was found, but no trip with given trip_id found"
                )
            if stop_res.shape[0] == 0:
                raise ValueError(
                    "A trip with given trip_id was found, but no stop with given stop_id found"
                )
            raise ValueError(
                "Given valid trip_id and stop_id, but no trip with the specified combination found"
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
            }
        )

    # trip_id から service_id を得る
    def get_trip_service_id(self, trip_id):
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
        res = df_stop[df_stop["stop_sequence"] == max_seq].index.values[0]
        return str(res.item())

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
