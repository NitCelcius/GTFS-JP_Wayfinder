import numpy as np
import pandas as pd

from gtfs_jp_wayfinder.services import wayfinder, wayfinder_adapter


def test_format_np_datetime_with_numpy_datetime64():
    dt = np.datetime64("2021-01-01T07:30:00")
    s = wayfinder.format_np_datetime(dt)
    assert s == "07:30:00"


def test_format_np_datetime_with_pandas_timestamp():
    dt = pd.Timestamp("2021-01-01T12:05:07")
    s = wayfinder.format_np_datetime(dt)
    assert s == "12:05:07"


def test_adapter_converts_time_fields(monkeypatch):
    # simulate underlying service returning raw numpy datetime values
    def fake_get_time(trip_id, stop_id):
        return {
            "trip_id": trip_id,
            "arrival_time": np.datetime64("2021-01-01T08:00:00"),
            "departure_time": pd.Timestamp("2021-01-01T08:00:00"),
        }

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder.get_time_from_trip_and_stop",
        fake_get_time,
    )

    res = wayfinder_adapter.get_time_from_trip_and_stop("t1", "s1")
    assert res["arrival_time"] == "08:00:00"
    assert res["departure_time"] == "08:00:00"
