"""Test that buses ending at a stop can be filtered out from /upcoming endpoint."""

from gtfs_jp_wayfinder.models import TripInfo, TripInfoList


def test_upcoming_includes_ending_buses_by_default(monkeypatch, client):
    """Test that buses ending at the stop are included by default."""
    stop_id = "1021_01"

    # Mock trips - some end at this stop, some don't
    trips = [
        "trip_ending_here",  # This one ends at 1021_01
        "trip_passing_through",  # This one passes through 1021_01
        "trip_ending_elsewhere",  # This one ends somewhere else
    ]

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
        lambda stop_id, service_id=None: trips,
    )

    # Mock time data for all trips
    time_map = {
        "trip_ending_here": {
            "trip_id": "trip_ending_here",
            "arrival_time": "08:00:00",
            "departure_time": "08:00:00",
        },
        "trip_passing_through": {
            "trip_id": "trip_passing_through",
            "arrival_time": "08:10:00",
            "departure_time": "08:10:00",
        },
        "trip_ending_elsewhere": {
            "trip_id": "trip_ending_elsewhere",
            "arrival_time": "08:20:00",
            "departure_time": "08:20:00",
        },
    }

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_times_from_trips_and_stop_batch",
        lambda trip_ids, stop_id, **kwargs: {
            tid: time_map[tid] for tid in trip_ids if tid in time_map
        },
    )

    # Mock trip info with destination_stop_id
    def mock_get_trip_info_batch(trip_ids):
        return TripInfoList(
            trips=[
                TripInfo(
                    trip_id="trip_ending_here",
                    route_name="Route A",
                    destination_display_name="中央公園",
                    destination_stop_id="1021_01",  # Same as current stop
                ),
                TripInfo(
                    trip_id="trip_passing_through",
                    route_name="Route B",
                    destination_display_name="東駅",
                    destination_stop_id="2000_01",  # Different stop
                ),
                TripInfo(
                    trip_id="trip_ending_elsewhere",
                    route_name="Route C",
                    destination_display_name="西口",
                    destination_stop_id="3000_01",  # Different stop
                ),
            ],
        )

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trip_info_batch",
        mock_get_trip_info_batch,
    )

    # Test default behavior (include_ending not specified = True)
    resp = client.get(f"/stops/{stop_id}/upcoming")
    assert resp.status_code == 200

    data = resp.json()
    assert "buses" in data

    # Should have all 3 buses (including the ending one)
    assert len(data["buses"]) == 3

    # Verify all trips are present
    trip_ids = [bus["trip_id"] for bus in data["buses"]]
    assert "trip_ending_here" in trip_ids
    assert "trip_passing_through" in trip_ids
    assert "trip_ending_elsewhere" in trip_ids


def test_upcoming_filters_ending_buses_when_requested(monkeypatch, client):
    """Test that buses ending at the stop are filtered out when include_ending=false."""
    stop_id = "1021_01"

    # Mock trips - some end at this stop, some don't
    trips = [
        "trip_ending_here",
        "trip_passing_through",
    ]

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
        lambda stop_id, service_id=None: trips,
    )

    # Mock time data
    time_map = {
        "trip_ending_here": {
            "trip_id": "trip_ending_here",
            "arrival_time": "08:00:00",
            "departure_time": "08:00:00",
        },
        "trip_passing_through": {
            "trip_id": "trip_passing_through",
            "arrival_time": "08:10:00",
            "departure_time": "08:10:00",
        },
    }

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_times_from_trips_and_stop_batch",
        lambda trip_ids, stop_id, **kwargs: {
            tid: time_map[tid] for tid in trip_ids if tid in time_map
        },
    )

    # Mock trip info
    def mock_get_trip_info_batch(trip_ids):
        return TripInfoList(
            trips=[
                TripInfo(
                    trip_id="trip_ending_here",
                    route_name="Route A",
                    destination_display_name="中央公園",
                    destination_stop_id="1021_01",
                ),
                TripInfo(
                    trip_id="trip_passing_through",
                    route_name="Route B",
                    destination_display_name="東駅",
                    destination_stop_id="2000_01",
                ),
            ],
        )

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trip_info_batch",
        mock_get_trip_info_batch,
    )

    # Test with include_ending=false
    resp = client.get(f"/stops/{stop_id}/upcoming?include_ending=false")
    assert resp.status_code == 200

    data = resp.json()
    assert "buses" in data

    # Should only have 1 bus (the ending one is filtered out)
    assert len(data["buses"]) == 1

    # Verify only the passing-through trip is present
    trip_ids = [bus["trip_id"] for bus in data["buses"]]
    assert "trip_ending_here" not in trip_ids
    assert "trip_passing_through" in trip_ids


def test_upcoming_handles_null_destination_stop_id(monkeypatch, client):
    """Test that trips with null destination_stop_id are not filtered out."""
    stop_id = "1021_01"

    trips = ["trip_with_null_destination"]

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
        lambda stop_id, service_id=None: trips,
    )

    time_map = {
        "trip_with_null_destination": {
            "trip_id": "trip_with_null_destination",
            "arrival_time": "08:00:00",
            "departure_time": "08:00:00",
        },
    }

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_times_from_trips_and_stop_batch",
        lambda trip_ids, stop_id, **kwargs: {
            tid: time_map[tid] for tid in trip_ids if tid in time_map
        },
    )

    # Mock trip info with None destination_stop_id
    def mock_get_trip_info_batch(trip_ids):
        return TripInfoList(
            trips=[
                TripInfo(
                    trip_id="trip_with_null_destination",
                    route_name="Route A",
                    destination_display_name="Unknown",
                    destination_stop_id=None,  # None/null destination
                ),
            ],
        )

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trip_info_batch",
        mock_get_trip_info_batch,
    )

    # Test default behavior - should NOT filter out trips with null destination
    resp = client.get(f"/stops/{stop_id}/upcoming")
    assert resp.status_code == 200

    data = resp.json()
    assert "buses" in data

    # Should still have the trip (null != stop_id)
    assert len(data["buses"]) == 1
    assert data["buses"][0]["trip_id"] == "trip_with_null_destination"
