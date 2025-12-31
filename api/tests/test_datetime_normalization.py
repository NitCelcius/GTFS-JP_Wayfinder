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


def test_format_np_datetime_gtfs_extended_hours_24():
    """Test that times >= 24:00 are preserved in GTFS extended hours format.

    GTFS-JP allows times like 24:05:00 to represent services running past midnight.
    When loaded via time_str_to_np_datetime(), these become next-day datetimes.
    format_np_datetime() must detect this and return the extended hours format.
    """
    # 24:05:00 becomes 2021-01-02T00:05:00 when parsed by numpy
    dt = np.datetime64("2021-01-02T00:05:00")
    s = wayfinder.format_np_datetime(dt)
    assert s == "24:05:00", f"Expected '24:05:00' but got '{s}'"


def test_format_np_datetime_gtfs_extended_hours_25():
    """Test 25:30:00 (1:30 AM next day in GTFS extended hours)."""
    # 25:30:00 becomes 2021-01-02T01:30:00 when parsed by numpy
    dt = np.datetime64("2021-01-02T01:30:00")
    s = wayfinder.format_np_datetime(dt)
    assert s == "25:30:00", f"Expected '25:30:00' but got '{s}'"


def test_format_np_datetime_gtfs_extended_hours_26():
    """Test 26:45:30 (2:45:30 AM next day in GTFS extended hours)."""
    # 26:45:30 becomes 2021-01-02T02:45:30 when parsed by numpy
    dt = np.datetime64("2021-01-02T02:45:30")
    s = wayfinder.format_np_datetime(dt)
    assert s == "26:45:30", f"Expected '26:45:30' but got '{s}'"


def test_format_np_datetime_gtfs_extended_hours_48():
    """Test 48:00:00 (midnight two days later in GTFS extended hours)."""
    # 48:00:00 becomes 2021-01-03T00:00:00 when parsed by numpy
    dt = np.datetime64("2021-01-03T00:00:00")
    s = wayfinder.format_np_datetime(dt)
    assert s == "48:00:00", f"Expected '48:00:00' but got '{s}'"


def test_format_np_datetime_midnight():
    """Test regular midnight (00:00:00) on default date."""
    dt = np.datetime64("2021-01-01T00:00:00")
    s = wayfinder.format_np_datetime(dt)
    assert s == "00:00:00", f"Expected '00:00:00' but got '{s}'"


def test_format_np_datetime_end_of_day():
    """Test 23:59:59 (end of default day)."""
    dt = np.datetime64("2021-01-01T23:59:59")
    s = wayfinder.format_np_datetime(dt)
    assert s == "23:59:59", f"Expected '23:59:59' but got '{s}'"


def test_adapter_converts_time_fields(monkeypatch):
    # simulate underlying service returning raw numpy datetime values
    # The adapter's get_time_from_trip_and_stop now calls get_times_from_trips_and_stop_batch
    def fake_get_times_batch(
        trip_ids, stop_id, trip_id_contains=None, min_arrival_time=None, max_items=None
    ):
        # The real batch function converts numpy/pandas datetime to strings
        # so our mock should do the same
        return {
            trip_id: {
                "trip_id": trip_id,
                "arrival_time": wayfinder.format_np_datetime(
                    np.datetime64("2021-01-01T08:00:00")
                ),
                "departure_time": wayfinder.format_np_datetime(
                    pd.Timestamp("2021-01-01T08:00:00")
                ),
            }
            for trip_id in trip_ids
        }

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_times_from_trips_and_stop_batch",
        fake_get_times_batch,
    )

    res = wayfinder_adapter.get_time_from_trip_and_stop("t1", "s1")
    assert res["arrival_time"] == "08:00:00"
    assert res["departure_time"] == "08:00:00"
