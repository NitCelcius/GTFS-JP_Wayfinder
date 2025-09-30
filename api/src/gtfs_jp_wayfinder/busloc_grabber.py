import datetime
from io import StringIO

import pandas as pd
import requests

BUSLOC_ENDPOINT = "https://akita.bustei.net/buslocation/IchigoMap.txt"


class BusLocGrabber:
    # get_time_param: str
    #   バスロケ用、時間指定のフォーマットを取得
    #   query_time: datetime.time
    #    - GPS情報を取得したい時刻
    def get_time_param(self, query_time: datetime.time):
        return f"{query_time.hour}{query_time.min}{query_time.second}"

    # get_busloc_URI: str
    #   バスロケ用、エンドポイントのURLを取得
    #   query_time: datetime.time
    #    - GPS情報を取得したい時刻
    def get_busloc_uri(self, query_time: datetime.time):
        return BUSLOC_ENDPOINT + "?" + BusLocGrabber.get_time_param(query_time)

    # fetch_busloc_raw: str
    #   バスロケ用、APIの応答を平文で取得
    #   query_time: datetime.time
    #    - GPS情報を取得したい時刻
    def fetch_busloc_raw(self, query_time: datetime.time):
        req = requests.get(BusLocGrabber.get_busloc_uri(query_time))
        return req.content.decode("utf-8-sig")

    # convert_busloc_raw_to_df: DataFrame
    #   バスロケ用、APIの応答を DataFrame で取得
    #   resp_str: str
    #    - APIの応答
    def convert_busloc_raw_to_df(self, resp_str: str):
        return pd.read_csv(
            StringIO(resp_str),
            header=None,
            names=[
                "gps_id",
                "keito",
                "bus_operator_id",
                "gps_time_raw",
                "gps_time_epoch",
                "latitude",
                "longitude",
                "minusOne",
                "konzatu_192",
                "client_version",
                "bus_dest",
                "keito_display_name",
                "late_minutes",
                "taxi_souls",
                "ninzuu",
                "mitu",
                "bus_stop_name",
                "bus_stop_route_prefix",
                "unused_18",
                "route_id",
                "icon_modify",
                "memo",
                "keito_number",
                "extra",
            ],
        ).drop(index=[-1])  # Drop last header row
