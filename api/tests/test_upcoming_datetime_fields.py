"""Test that arrival_datetime and departure_datetime fields are properly filled in upcoming endpoint with stops expansion."""

import datetime

from fastapi.testclient import TestClient

from gtfs_jp_wayfinder.main import app
from gtfs_jp_wayfinder.services.wayfinder_adapter import merge_date_and_time_to_iso

client = TestClient(app)


def test_upcoming_stops_have_datetime_fields(monkeypatch, client):
    """Test that stops in expand=stops have arrival_datetime and departure_datetime fields."""
    stop_id = "S100"

    # Mock trips and their stop data
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
        lambda stop, s=None: ["trip_001"],
    )

    # Mock the batch function for arrival/departure times
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_times_from_trips_and_stop_batch",
        lambda trip_ids, stop_id, **kwargs: {
            "trip_001": {
                "trip_id": "trip_001",
                "arrival_time": "08:30:00",
                "departure_time": "08:32:00",
            }
        },
    )

    # The actual get_stops_from_trip function will be called with the reference_date
    # We need to verify it receives the reference_date and uses it correctly
    def mock_get_stops_from_trip(trip_id, reference_date=None):
        """Mock that simulates the actual behavior with datetime field generation."""
        stops = [
            {
                "trip_id": trip_id,
                "arrival_time": "08:30:00",
                "departure_time": "08:32:00",
                "stop_id": "S100",
                "stop_sequence": 1,
                "stop_headsign": "First Stop",
                "stop_name": "First Stop Name",
            },
            {
                "trip_id": trip_id,
                "arrival_time": "08:45:00",
                "departure_time": "08:47:00",
                "stop_id": "S101",
                "stop_sequence": 2,
                "stop_headsign": "Second Stop",
                "stop_name": "Second Stop Name",
            },
        ]

        # If reference_date is provided, add datetime fields (like the real implementation)
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

    # Call the endpoint with stops expansion
    today = datetime.date.today().isoformat()
    resp = client.get(f"/stops/{stop_id}/upcoming?expand=stops")
    assert resp.status_code == 200
    body = resp.json()

    # Verify the response structure
    assert body["stop_id"] == stop_id
    assert len(body["buses"]) == 1

    bus = body["buses"][0]
    assert bus["trip_id"] == "trip_001"
    assert bus["arrival_time"] == "08:30:00"
    assert bus["departure_time"] == "08:32:00"

    # Verify that bus-level datetime fields are present
    assert "arrival_datetime" in bus
    assert "departure_datetime" in bus
    assert bus["arrival_datetime"] == f"{today}T08:30:00"
    assert bus["departure_datetime"] == f"{today}T08:32:00"

    # Verify that stops are populated
    assert bus["stops"] is not None
    assert len(bus["stops"]) == 2

    # Verify that each stop has datetime fields
    stop1 = bus["stops"][0]
    assert stop1["stop_id"] == "S100"
    assert stop1["arrival_time"] == "08:30:00"
    assert stop1["departure_time"] == "08:32:00"
    assert "arrival_datetime" in stop1
    assert "departure_datetime" in stop1
    assert stop1["arrival_datetime"] == f"{today}T08:30:00"
    assert stop1["departure_datetime"] == f"{today}T08:32:00"

    stop2 = bus["stops"][1]
    assert stop2["stop_id"] == "S101"
    assert stop2["arrival_time"] == "08:45:00"
    assert stop2["departure_time"] == "08:47:00"
    assert "arrival_datetime" in stop2
    assert "departure_datetime" in stop2
    assert stop2["arrival_datetime"] == f"{today}T08:45:00"
    assert stop2["departure_datetime"] == f"{today}T08:47:00"


def test_upcoming_with_begin_time_iso_format(monkeypatch, client):
    """Test that stops respect the begin_time ISO format for datetime fields."""
    stop_id = "S100"
    test_date = "2025-12-25"

    # Mock trips and their stop data
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
        lambda stop, s=None: ["trip_002"],
    )

    # Mock the batch function
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_times_from_trips_and_stop_batch",
        lambda trip_ids, stop_id, **kwargs: {
            "trip_002": {
                "trip_id": "trip_002",
                "arrival_time": "10:15:00",
                "departure_time": "10:17:00",
            }
        },
    )

    def mock_get_stops_from_trip(trip_id, reference_date=None):
        """Mock that uses the reference_date."""
        stops = [
            {
                "trip_id": trip_id,
                "arrival_time": "10:15:00",
                "departure_time": "10:17:00",
                "stop_id": "S100",
                "stop_sequence": 1,
                "stop_headsign": "Test Stop",
                "stop_name": "Test Stop",
            }
        ]

        if reference_date:
            for stop in stops:
                stop["arrival_datetime"] = merge_date_and_time_to_iso(
                    reference_date,
                    stop["arrival_time"],
                )
                stop["departure_datetime"] = merge_date_and_time_to_iso(
                    reference_date,
                    stop["departure_time"],
                )

        return stops

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stops_from_trip",
        mock_get_stops_from_trip,
    )

    # Call endpoint with ISO format begin_time
    resp = client.get(
        f"/stops/{stop_id}/upcoming?expand=stops&begin_time={test_date}T09:00:00",
    )
    assert resp.status_code == 200
    body = resp.json()

    bus = body["buses"][0]
    stop = bus["stops"][0]

    # Verify datetime fields use the specified date from begin_time
    assert stop["arrival_datetime"] == f"{test_date}T10:15:00"
    assert stop["departure_datetime"] == f"{test_date}T10:17:00"
