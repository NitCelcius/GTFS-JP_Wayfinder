from fastapi.testclient import TestClient

from gtfs_jp_wayfinder.main import app

client = TestClient(app)


def test_upcoming_stops_expansion(monkeypatch):
    """Test that expand=stops properly populates the stops field"""
    stop_id = "S100"

    # Mock trips and their stop data
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
        lambda stop, s=None: ["tA"],
    )
    
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_time_from_trip_and_stop",
        lambda trip, stop: {"arrival_time": "07:00:00", "departure_time": "07:05:00"},
    )

    # Mock stops from trip
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stops_from_trip",
        lambda trip_id: [
            {
                "trip_id": trip_id,
                "arrival_time": "07:00:00",
                "departure_time": "07:05:00",
                "stop_id": "S100",
                "stop_sequence": 1,
                "stop_headsign": "Test Stop",
            },
            {
                "trip_id": trip_id,
                "arrival_time": "07:10:00",
                "departure_time": "07:12:00",
                "stop_id": "S101",
                "stop_sequence": 2,
                "stop_headsign": "Next Stop",
            }
        ]
    )

    # Test without stops expansion - should have null stops
    resp1 = client.get(f"/stops/{stop_id}/upcoming")
    assert resp1.status_code == 200
    body1 = resp1.json()
    assert body1["buses"][0]["stops"] is None

    # Test with stops expansion - should populate stops field
    resp2 = client.get(f"/stops/{stop_id}/upcoming?expand=stops")
    assert resp2.status_code == 200
    body2 = resp2.json()
    assert body2["buses"][0]["stops"] is not None
    assert len(body2["buses"][0]["stops"]) == 2
    assert body2["buses"][0]["stops"][0]["stop_id"] == "S100"
    assert body2["buses"][0]["stops"][1]["stop_id"] == "S101"


def test_upcoming_combined_expansion(monkeypatch):
    """Test that expand=trip_info,stops works correctly together"""
    stop_id = "S100"

    # Mock trips and their stop data
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
        lambda stop, s=None: ["tA"],
    )
    
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_time_from_trip_and_stop",
        lambda trip, stop: {"arrival_time": "07:00:00", "departure_time": "07:05:00"},
    )

    # Mock trip info
    from gtfs_jp_wayfinder.models import TripInfoList, TripInfo
    def mock_trip_info_batch(trip_ids):
        return TripInfoList(trips=[
            TripInfo(
                trip_id="tA",
                route_name="Test Route",
                destination_display_name="Test Destination",
                destination_stop_id="S999"
            )
        ])

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trip_info_batch",
        mock_trip_info_batch
    )

    # Mock stops from trip
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stops_from_trip",
        lambda trip_id: [
            {
                "trip_id": trip_id,
                "arrival_time": "07:00:00",
                "departure_time": "07:05:00",
                "stop_id": "S100",
                "stop_sequence": 1,
                "stop_headsign": "Test Stop",
            }
        ]
    )

    # Test with both expansions
    resp = client.get(f"/stops/{stop_id}/upcoming?expand=trip_info,stops")
    assert resp.status_code == 200
    body = resp.json()
    
    # Check basic structure
    assert body["stop_id"] == stop_id
    assert len(body["buses"]) == 1
    
    bus = body["buses"][0]
    
    # Check trip info expansion worked
    assert bus["route_name"] == "Test Route"
    assert bus["destination_display_name"] == "Test Destination"
    assert bus["destination_stop_id"] == "S999"
    
    # Check stops expansion worked
    assert bus["stops"] is not None
    assert len(bus["stops"]) == 1
    assert bus["stops"][0]["stop_id"] == "S100"