from fastapi.testclient import TestClient

from gtfs_jp_wayfinder.main import app

client = TestClient(app)
TZ_SUFFIX = "+09:00"


def test_trip_stops(monkeypatch):
    # adapter returns list of stop records (dicts)
    def fake_stops(trip_id, reference_date=None, from_stop_id=None):
        return [
            {
                "trip_id": trip_id,
                "arrival_time": "08:00:00",
                "departure_time": "08:00:00",
                "arrival_datetime": f"2025-10-29T08:00:00{TZ_SUFFIX}",
                "departure_datetime": f"2025-10-29T08:00:00{TZ_SUFFIX}",
                "stop_id": "S1",
                "stop_sequence": 1,
                "stop_headsign": "Central",
                "stop_name": None,
                "fare": None,
            },
        ]

    def fake_default_date():
        return "2025-10-29"

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stops_from_trip",
        fake_stops,
    )
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_default_date",
        fake_default_date,
    )

    resp = client.get("/trips/t1/stops")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert data[0]["trip_id"] == "t1"


def test_trip_passing_and_fare(monkeypatch):
    # get_time_from_trip_and_stop -> TripRecord fields
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_time_from_trip_and_stop",
        lambda trip_id, stop_id: {
            "arrival_time": "09:00:00",
            "departure_time": "09:05:00",
            "fare": 200,
        },
    )
    # Mock get_default_date as it's called by the endpoint
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_default_date",
        lambda: "2025-10-29",
    )

    resp = client.get("/trips/t1/passing?stop_id=S1")
    assert resp.status_code == 200
    body = resp.json()
    assert body["trip_id"] == "t1"
    assert body["stop_id"] == "S1"
    assert body["fare"] == 200

    # fare endpoint
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_fare_by_stops",
        lambda f, t: 170,
    )
    resp2 = client.get("/trips/fare?from_id=S1&to_id=S2")
    assert resp2.status_code == 200
    assert resp2.json()["fare"] == 170


def test_trip_stops_with_from_stop_id(monkeypatch):
    """Test that from_stop_id parameter is passed to get_stops_from_trip."""
    captured_args = {}

    def fake_stops(trip_id, reference_date=None, from_stop_id=None):
        captured_args["trip_id"] = trip_id
        captured_args["reference_date"] = reference_date
        captured_args["from_stop_id"] = from_stop_id
        return [
            {
                "trip_id": trip_id,
                "arrival_time": "08:00:00",
                "departure_time": "08:00:00",
                "arrival_datetime": f"2025-10-29T08:00:00{TZ_SUFFIX}",
                "departure_datetime": f"2025-10-29T08:00:00{TZ_SUFFIX}",
                "stop_id": "S1",
                "stop_sequence": 1,
                "stop_headsign": "Central",
                "stop_name": None,
                "fare": None,
            },
            {
                "trip_id": trip_id,
                "arrival_time": "08:15:00",
                "departure_time": "08:15:00",
                "arrival_datetime": f"2025-10-29T08:15:00{TZ_SUFFIX}",
                "departure_datetime": f"2025-10-29T08:15:00{TZ_SUFFIX}",
                "stop_id": "S2",
                "stop_sequence": 2,
                "stop_headsign": "Central",
                "stop_name": None,
                "fare": 200 if from_stop_id == "S1" else 100,
            },
        ]

    def fake_default_date():
        return "2025-10-29"

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stops_from_trip",
        fake_stops,
    )
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_default_date",
        fake_default_date,
    )

    # Test with from_stop_id parameter
    resp = client.get("/trips/t1/stops?from_stop_id=S1")
    assert resp.status_code == 200
    data = resp.json()

    # Verify the from_stop_id was passed to the adapter
    assert captured_args["from_stop_id"] == "S1"
    assert captured_args["trip_id"] == "t1"

    # Verify fares were calculated from S1 (should be 200 for S2)
    assert data[1]["fare"] == 200

    # Test without from_stop_id parameter (backward compatibility)
    captured_args.clear()
    resp2 = client.get("/trips/t1/stops")
    assert resp2.status_code == 200
    data2 = resp2.json()

    # Without from_stop_id, it should be None (fares calculated from first stop)
    assert captured_args["from_stop_id"] is None
    # Without from_stop_id, fare should be 100 (as per mock logic)
    assert data2[1]["fare"] == 100
