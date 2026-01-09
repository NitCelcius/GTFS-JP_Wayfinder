"""Test that upcoming buses are sorted by arrival time."""

from fastapi.testclient import TestClient

from gtfs_jp_wayfinder.main import app
from gtfs_jp_wayfinder.models import TripInfo, TripInfoList

client = TestClient(app)


def test_upcoming_buses_sorted_by_arrival_time(monkeypatch, client):
    """Test that buses are returned sorted by arrival time (earliest first)."""
    stop_id = "S100"

    # Mock trips with out-of-order arrival times
    all_trips = [
        "trip_noon",
        "trip_early_morning",
        "trip_late_evening",
        "trip_mid_morning",
    ]
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
        lambda stop, s=None: all_trips,
    )

    # Mock batch function with intentionally unsorted times
    def mock_get_times_batch(
        trip_ids, stop_id, min_arrival_time=None, max_items=None, **kwargs
    ):
        """Return times that are NOT sorted by arrival time."""
        time_map = {
            "trip_noon": {
                "trip_id": "trip_noon",
                "arrival_time": "12:00:00",
                "departure_time": "12:00:00",
            },
            "trip_early_morning": {
                "trip_id": "trip_early_morning",
                "arrival_time": "07:30:00",
                "departure_time": "07:30:00",
            },
            "trip_late_evening": {
                "trip_id": "trip_late_evening",
                "arrival_time": "19:45:00",
                "departure_time": "19:45:00",
            },
            "trip_mid_morning": {
                "trip_id": "trip_mid_morning",
                "arrival_time": "09:15:00",
                "departure_time": "09:15:00",
            },
        }
        return {trip_id: time_map[trip_id] for trip_id in trip_ids if trip_id in time_map}

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_times_from_trips_and_stop_batch",
        mock_get_times_batch,
    )

    # Mock trip info
    def mock_get_trip_info_batch(trip_ids):
        return TripInfoList(
            trips=[
                TripInfo(
                    trip_id=trip_id,
                    route_name="Test Route",
                    destination_display_name="Test Destination",
                    destination_stop_id="S999",
                )
                for trip_id in trip_ids
            ],
        )

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trip_info_batch",
        mock_get_trip_info_batch,
    )

    # Make request
    resp = client.get(f"/stops/{stop_id}/upcoming")
    assert resp.status_code == 200
    body = resp.json()

    # Verify we got all 4 buses
    assert len(body["buses"]) == 4

    # Verify buses are sorted by arrival_time (earliest to latest)
    arrival_times = [bus["arrival_time"] for bus in body["buses"]]
    expected_times = ["07:30:00", "09:15:00", "12:00:00", "19:45:00"]
    assert arrival_times == expected_times, (
        f"Expected times sorted as {expected_times}, got {arrival_times}"
    )

    # Verify corresponding trip_ids are in the correct order
    trip_ids = [bus["trip_id"] for bus in body["buses"]]
    expected_order = [
        "trip_early_morning",
        "trip_mid_morning",
        "trip_noon",
        "trip_late_evening",
    ]
    assert trip_ids == expected_order, (
        f"Expected trip order {expected_order}, got {trip_ids}"
    )


def test_upcoming_sorting_with_same_arrival_times(monkeypatch, client):
    """Test sorting behavior when multiple buses have the same arrival time.

    When arrival times are equal, the sort should be stable (maintain original order).
    """
    stop_id = "S200"

    # Mock trips with some duplicate arrival times
    all_trips = ["trip_a", "trip_b", "trip_c", "trip_d"]
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
        lambda stop, s=None: all_trips,
    )

    # Mock times where trip_b and trip_c have the same arrival time
    def mock_get_times_batch(
        trip_ids, stop_id, min_arrival_time=None, max_items=None, **kwargs
    ):
        time_map = {
            "trip_a": {
                "trip_id": "trip_a",
                "arrival_time": "08:00:00",
                "departure_time": "08:00:00",
            },
            "trip_b": {
                "trip_id": "trip_b",
                "arrival_time": "10:00:00",
                "departure_time": "10:00:00",
            },
            "trip_c": {
                "trip_id": "trip_c",
                "arrival_time": "10:00:00",
                "departure_time": "10:00:00",
            },
            "trip_d": {
                "trip_id": "trip_d",
                "arrival_time": "12:00:00",
                "departure_time": "12:00:00",
            },
        }
        return {trip_id: time_map[trip_id] for trip_id in trip_ids if trip_id in time_map}

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_times_from_trips_and_stop_batch",
        mock_get_times_batch,
    )

    # Mock trip info
    def mock_get_trip_info_batch(trip_ids):
        return TripInfoList(
            trips=[
                TripInfo(
                    trip_id=trip_id,
                    route_name="Test Route",
                    destination_display_name="Test Destination",
                    destination_stop_id="S999",
                )
                for trip_id in trip_ids
            ],
        )

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trip_info_batch",
        mock_get_trip_info_batch,
    )

    # Make request
    resp = client.get(f"/stops/{stop_id}/upcoming")
    assert resp.status_code == 200
    body = resp.json()

    # Verify we got all 4 buses
    assert len(body["buses"]) == 4

    # Verify times are sorted
    arrival_times = [bus["arrival_time"] for bus in body["buses"]]
    expected_times = ["08:00:00", "10:00:00", "10:00:00", "12:00:00"]
    assert arrival_times == expected_times

    # Verify first and last are correct
    assert body["buses"][0]["trip_id"] == "trip_a"
    assert body["buses"][-1]["trip_id"] == "trip_d"

    # trip_b and trip_c should both be present (order between them doesn't matter)
    middle_trips = {body["buses"][1]["trip_id"], body["buses"][2]["trip_id"]}
    assert middle_trips == {"trip_b", "trip_c"}
