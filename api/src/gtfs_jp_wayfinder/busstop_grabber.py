import datetime
import re

import pandas as pd
import requests

BUSSTOP_ENDPOINT = "https://akita.bustei.net/time/"


class BusStopGrabber:
    def get_busstop_uri(self, route_id: str, query_time: datetime.time):
        # なんか知らんけど、_ で区切っていることはわかる
        route_id_split = route_id.split("_")
        return (
            BUSSTOP_ENDPOINT
            + route_id_split[2]
            + "/"
            + "teiryu-"
            + route_id
            + ".js?"
            + str(query_time.hour)
            + str(query_time.minute)
            + str(query_time.second)
        )

    def fetch_busstop_raw(self, route_id: str, query_time: datetime.time):
        req = requests.get(BusStopGrabber.get_busstop_uri(route_id, query_time))
        resp_str = req.content.decode("utf-8-sig")
        return resp_str

    # route_id = "01_1449_400401"
    # fetch_time = datetime.datetime.now(ZoneInfo("Asia/Tokyo")).time()
    def fetch_bus_stop_list(self, route_id: str, fetch_time: datetime.time):
        bs = BusStopGrabber.fetch_busstop_raw(route_id=route_id, query_time=fetch_time)

        entries = re.findall(r"T\((.*)\)", bs)  # TODO: compile させる

        resList = []
        for entry in entries:
            split_entry = entry.split(",")

            html_detail = split_entry[3]
            stop_num = -1  # 終点なら上書きされない
            stop_name = ""
            stop_scheduled_time = ""

            stop_num_res = re.search(r"<FONT SIZE=4>(\d*)\.", html_detail)
            if stop_num_res:
                stop_num = int(stop_num_res.group(1))

            stop_name_res = re.search(
                "</FONT>(.*?)<FONT COLOR=#0000FF>", html_detail
            )  # ＜＜ みたいなのが出力されない説
            if stop_name_res:
                stop_name = str(stop_name_res.group(1)).strip()
                # 最後の停留所は font size = 6 なのでこっちも探す
            else:
                stop_terminal_res = re.search(
                    "<FONT SIZE=6>(.*)<FONT COLOR=#0000FF>", html_detail
                )
                if stop_terminal_res:
                    stop_name = str(stop_terminal_res.group(1)).strip()
                else:
                    raise Exception("stop_name_res not found!")

            stop_scheduled_time_res = re.search(
                r"<FONT COLOR=#0000FF>(\d\d:\d\d)</FONT>", html_detail
            )
            if stop_scheduled_time_res:
                stop_scheduled_time = stop_scheduled_time_res.group(1)

            resList.append([stop_num, stop_name, stop_scheduled_time])

        return pd.DataFrame(
            resList, columns=["stop_num", "stop_name", "stop_scheduled_time"]
        )

        # 系統番号、不要と判断
        # バス停の名前も不要と判断 (最初と最後を抜き出せばOK; <循環後>とか気になるならあとで取り出してもよい)
        # <BR><FONT COLOR=#$FF0000 SIZE=5>系統 900101</FONT><BR><FONT SIZE=5>（買物広場 → 買物広場）</FONT>
