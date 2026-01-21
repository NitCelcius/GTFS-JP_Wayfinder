"""Test that begin_time parameter properly filters upcoming buses."""

from fastapi.testclient import TestClient

from gtfs_jp_wayfinder.main import app
from gtfs_jp_wayfinder.models import TripInfo, TripInfoList

client = TestClient(app)
TZ_SUFFIX = "+09:00"


def test_upcoming_with_begin_time_filters_past_buses(monkeypatch, client):
    """Test that begin_time parameter filters out buses that have already departed."""
    stop_id = "S100"

    # Mock service_id lookup to return a valid service_id
    # (otherwise the endpoint returns empty for dates outside GTFS calendar)
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_service_ids_for_date",
        lambda date_str: ["平日"],
    )

    # Mock trips with various departure times
    all_trips = ["trip_early", "trip_current", "trip_later"]
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
        lambda stop, s=None: all_trips,
    )

    # Mock batch function that should receive min_arrival_time parameter
    received_min_arrival_time = []

    def mock_get_times_batch(
        trip_ids, stop_id, min_arrival_time=None, max_items=None, **kwargs
    ):
        """Mock that tracks the min_arrival_time parameter."""
        received_min_arrival_time.append(min_arrival_time)

        # Return times for all trips
        # trip_early: 07:00:00 (should be filtered out when begin_time=08:00:00)
        # trip_current: 08:00:00 (should be included when begin_time=08:00:00)
        # trip_later: 09:00:00 (should be included when begin_time=08:00:00)
        all_times = {
            "trip_early": {
                "trip_id": "trip_early",
                "arrival_time": "07:00:00",
                "departure_time": "07:00:00",
            },
            "trip_current": {
                "trip_id": "trip_current",
                "arrival_time": "08:00:00",
                "departure_time": "08:00:00",
            },
            "trip_later": {
                "trip_id": "trip_later",
                "arrival_time": "09:00:00",
                "departure_time": "09:00:00",
            },
        }

        # Apply min_arrival_time filter if provided (simulating the real function)
        if min_arrival_time:
            # Convert time strings to seconds for comparison
            def time_to_seconds(time_str):
                parts = time_str.split(":")
                return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])

            min_seconds = time_to_seconds(min_arrival_time)
            filtered_times = {}
            for trip_id in trip_ids:
                if trip_id in all_times:
                    arrival = all_times[trip_id]["arrival_time"]
                    if time_to_seconds(arrival) >= min_seconds:
                        filtered_times[trip_id] = all_times[trip_id]
            return filtered_times

        # Return all times if no filter
        return {trip_id: all_times[trip_id] for trip_id in trip_ids if trip_id in all_times}

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

    # Test 1: Without begin_time, should get all buses
    resp1 = client.get(f"/stops/{stop_id}/upcoming")
    assert resp1.status_code == 200
    body1 = resp1.json()
    assert len(body1["buses"]) == 3
    assert received_min_arrival_time[-1] is None  # No filter applied

    # Test 2: With begin_time=08:00:00, should only get buses at or after 08:00:00
    received_min_arrival_time.clear()
    resp2 = client.get(f"/stops/{stop_id}/upcoming?begin_time=08:00:00")
    assert resp2.status_code == 200
    body2 = resp2.json()

    # Verify that min_arrival_time was passed to the batch function
    assert received_min_arrival_time[-1] == "08:00:00"

    # Verify that only trip_current and trip_later are included
    assert len(body2["buses"]) == 2
    trip_ids = [bus["trip_id"] for bus in body2["buses"]]
    assert "trip_early" not in trip_ids
    assert "trip_current" in trip_ids
    assert "trip_later" in trip_ids

    # Test 3: With begin_time as ISO datetime, should extract time and filter
    received_min_arrival_time.clear()
    resp3 = client.get(f"/stops/{stop_id}/upcoming?begin_time=2025-10-28T08:30:00")
    assert resp3.status_code == 200
    body3 = resp3.json()

    # Verify that min_arrival_time was extracted correctly
    assert received_min_arrival_time[-1] == "08:30:00"

    # Verify that only trip_later is included (09:00:00 >= 08:30:00)
    assert len(body3["buses"]) == 1
    assert body3["buses"][0]["trip_id"] == "trip_later"


def test_upcoming_without_begin_time_no_filtering(monkeypatch, client):
    """Test that without begin_time, no time filtering is applied."""
    stop_id = "S100"

    # Mock service_id lookup to return a valid service_id
    # (otherwise the endpoint returns empty for dates outside GTFS calendar)
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_service_ids_for_date",
        lambda date_str: ["平日"],
    )

    # Track whether min_arrival_time is None
    received_params = []

    def mock_get_times_batch(
        trip_ids, stop_id, min_arrival_time=None, max_items=None, **kwargs
    ):
        received_params.append(
            {"min_arrival_time": min_arrival_time, "max_items": max_items}
        )
        return {
            trip_id: {
                "trip_id": trip_id,
                "arrival_time": "08:00:00",
                "departure_time": "08:00:00",
            }
            for trip_id in trip_ids
        }

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
        lambda stop, s=None: ["trip1"],
    )

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_times_from_trips_and_stop_batch",
        mock_get_times_batch,
    )

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trip_info_batch",
        lambda trip_ids: TripInfoList(
            trips=[
                TripInfo(
                    trip_id=trip_id,
                    route_name="Test Route",
                    destination_display_name="Test Destination",
                    destination_stop_id="S999",
                )
                for trip_id in trip_ids
            ],
        ),
    )

    # Request without begin_time
    resp = client.get(f"/stops/{stop_id}/upcoming")
    assert resp.status_code == 200

    # Verify that min_arrival_time was None
    assert len(received_params) > 0
    assert received_params[-1]["min_arrival_time"] is None
