import json
from pathlib import Path

from fastapi.testclient import TestClient

from gtfs_jp_wayfinder.main import app

client = TestClient(app)


def test_upcoming_hardcoded(monkeypatch, client):
    fixture_path = Path(__file__).parent / "fixtures" / "upcoming_1021_01.json"
    expected = json.loads(fixture_path.read_text(encoding="utf-8"))

    trips = [b["trip_id"] for b in expected["buses"]]

    # patch adapter functions to return the trips and their times from `expected`
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
        lambda stop_id, service_id=None: trips,
    )

    time_map = {
        b["trip_id"]: {
            "trip_id": b["trip_id"],
            "arrival_time": b["arrival_time"],
            "departure_time": b["departure_time"],
        }
        for b in expected["buses"]
    }

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_time_from_trip_and_stop",
        lambda trip_id, stop_id: time_map[trip_id],
    )

    # Mock the new batch function to return the batch time data
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_times_from_trips_and_stop_batch",
        lambda trip_ids, stop_id, **kwargs: {
            trip_id: time_map[trip_id] for trip_id in trip_ids if trip_id in time_map
        },
    )

    resp = client.get("/stops/1021_01/upcoming")
    assert resp.status_code == 200
    assert resp.json() == expected
