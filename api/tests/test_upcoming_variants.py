from fastapi.testclient import TestClient

from gtfs_jp_wayfinder.main import app

client = TestClient(app)


def test_upcoming_variants(monkeypatch, client):
    stop_id = "S100"

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
        lambda stop, s=None: None,
    )
    resp = client.get(f"/stops/{stop_id}/upcoming")
    assert resp.status_code == 200
    assert resp.json() == {"stop_id": stop_id, "buses": []}

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
        lambda stop, s=None: ["tA", "tB"],
    )
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_time_from_trip_and_stop",
        lambda trip, stop: {"arrival_time": "07:00:00", "departure_time": "07:05:00"},
    )

    # Mock the new batch function
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_times_from_trips_and_stop_batch",
        lambda trip_ids, stop_id, **kwargs: {
            trip_id: {
                "trip_id": trip_id,
                "arrival_time": "07:00:00",
                "departure_time": "07:05:00",
            }
            for trip_id in trip_ids
        },
    )

    resp2 = client.get(f"/stops/{stop_id}/upcoming")
    assert resp2.status_code == 200
    body = resp2.json()
    assert body["stop_id"] == stop_id
    assert len(body["buses"]) == 2
    assert body["buses"][0]["trip_id"] == "tA"
