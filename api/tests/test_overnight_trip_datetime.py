"""Test overnight trip handling in stops expansion with datetime fields."""

from fastapi.testclient import TestClient

from gtfs_jp_wayfinder.main import app
from gtfs_jp_wayfinder.services.wayfinder_adapter import merge_date_and_time_to_iso

client = TestClient(app)


def test_overnight_trip_stops_datetime_fields(monkeypatch, client):
    """Test that stops crossing midnight have correct datetime fields"""
    stop_id = "LATE_STOP"
    test_date = "2025-10-31"

    # Mock trips and their stop data
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
        lambda stop, s=None: ["late_night_trip"],
    )

    # Mock the batch function - bus departs at 23:45
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_times_from_trips_and_stop_batch",
        lambda trip_ids, stop_id, **kwargs: {
            "late_night_trip": {
                "trip_id": "late_night_trip",
                "arrival_time": "23:45:00",
                "departure_time": "23:47:00",
            }
        },
    )

    def mock_get_stops_from_trip(trip_id, reference_date=None):
        """Mock simulating a trip that crosses midnight.

        Data:
        - Stop 1 (23:45) - late evening, same day
        - Stop 2 (23:58) - just before midnight, same day
        - Stop 3 (24:05) - after midnight (GTFS extended hours), next day
        - Stop 4 (24:15) - after midnight (GTFS extended hours), next day

        GTFS uses extended hours (24:00+) to represent times after midnight
        that are part of the same "service day".
        """
        stops = [
            {
                "trip_id": trip_id,
                "arrival_time": "23:45:00",
                "departure_time": "23:47:00",
                "stop_id": "LATE_STOP",
                "stop_sequence": 1,
                "stop_headsign": "Late Evening Stop",
                "stop_name": "Late Evening Stop",
            },
            {
                "trip_id": trip_id,
                "arrival_time": "23:58:00",
                "departure_time": "23:59:00",
                "stop_id": "ALMOST_MIDNIGHT",
                "stop_sequence": 2,
                "stop_headsign": "Almost Midnight Stop",
                "stop_name": "Almost Midnight Stop",
            },
            {
                "trip_id": trip_id,
                "arrival_time": "24:05:00",  # GTFS extended hours
                "departure_time": "24:06:00",
                "stop_id": "AFTER_MIDNIGHT_1",
                "stop_sequence": 3,
                "stop_headsign": "After Midnight Stop 1",
                "stop_name": "After Midnight Stop 1",
            },
            {
                "trip_id": trip_id,
                "arrival_time": "24:15:00",  # GTFS extended hours
                "departure_time": "24:16:00",
                "stop_id": "AFTER_MIDNIGHT_2",
                "stop_sequence": 4,
                "stop_headsign": "After Midnight Stop 2",
                "stop_name": "After Midnight Stop 2",
            },
        ]

        # Add datetime fields if reference_date is provided
        if reference_date:
            for stop in stops:
                arrival_time = stop.get("arrival_time")
                departure_time = stop.get("departure_time")

                if arrival_time:
                    stop["arrival_datetime"] = merge_date_and_time_to_iso(
                        reference_date,
                        arrival_time,
                    )
                if departure_time:
                    stop["departure_datetime"] = merge_date_and_time_to_iso(
                        reference_date,
                        departure_time,
                    )

        return stops

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stops_from_trip",
        mock_get_stops_from_trip,
    )

    # Call the endpoint with ISO format begin_time
    resp = client.get(
        f"/stops/{stop_id}/upcoming?expand=stops&begin_time={test_date}T20:00:00",
    )
    assert resp.status_code == 200
    body = resp.json()

    bus = body["buses"][0]
    stops = bus["stops"]

    # Verify we have all 4 stops
    assert len(stops) == 4

    # Stop 1: Late evening (23:45) - should use test_date
    stop1 = stops[0]
    assert stop1["arrival_time"] == "23:45:00"
    tz_suffix = "+09:00"
    assert stop1["arrival_datetime"] == f"{test_date}T23:45:00{tz_suffix}"
    assert stop1["departure_datetime"] == f"{test_date}T23:47:00{tz_suffix}"

    # Stop 2: Almost midnight (23:58) - should use test_date
    stop2 = stops[1]
    assert stop2["arrival_time"] == "23:58:00"
    assert stop2["arrival_datetime"] == f"{test_date}T23:58:00{tz_suffix}"
    assert stop2["departure_datetime"] == f"{test_date}T23:59:00{tz_suffix}"

    # Stop 3: After midnight (24:05 in GTFS extended hours) - Should be next day
    # GTFS extended hours (24:00+) are now properly converted to next day
    stop3 = stops[2]
    assert stop3["arrival_time"] == "24:05:00"
    assert (
        stop3["arrival_datetime"] == "2025-11-01T00:05:00+09:00"
    )  # Correctly next day!
    assert stop3["departure_datetime"] == "2025-11-01T00:06:00+09:00"

    # Stop 4: After midnight (24:15 in GTFS extended hours) - Should be next day
    stop4 = stops[3]
    assert stop4["arrival_time"] == "24:15:00"
    assert (
        stop4["arrival_datetime"] == "2025-11-01T00:15:00+09:00"
    )  # Correctly next day!
    assert stop4["departure_datetime"] == "2025-11-01T00:16:00+09:00"


def test_merge_date_and_time_to_iso_basic_cases():
    """Test the merge_date_and_time_to_iso function with various inputs."""

    # Basic cases
    assert (
        merge_date_and_time_to_iso("2025-10-31", "14:30:00")
        == "2025-10-31T14:30:00+09:00"
    )
    assert (
        merge_date_and_time_to_iso("2025-10-31", "14:30") == "2025-10-31T14:30:00+09:00"
    )

    # Midnight
    assert (
        merge_date_and_time_to_iso("2025-10-31", "00:00:00")
        == "2025-10-31T00:00:00+09:00"
    )

    # End of day
    assert (
        merge_date_and_time_to_iso("2025-10-31", "23:59:59")
        == "2025-10-31T23:59:59+09:00"
    )

    # GTFS extended hours - hours >= 24 indicate next day
    assert (
        merge_date_and_time_to_iso("2025-10-31", "24:00:00")
        == "2025-11-01T00:00:00+09:00"
    )
    assert (
        merge_date_and_time_to_iso("2025-10-31", "25:30:00")
        == "2025-11-01T01:30:00+09:00"
    )
    assert (
        merge_date_and_time_to_iso("2025-10-31", "26:45:30")
        == "2025-11-01T02:45:30+09:00"
    )

    # Extended hours beyond 48 (two days later)
    assert (
        merge_date_and_time_to_iso("2025-10-31", "48:00:00")
        == "2025-11-02T00:00:00+09:00"
    )
