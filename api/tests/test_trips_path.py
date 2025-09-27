from fastapi.testclient import TestClient

from gtfs_jp_wayfinder import models
from gtfs_jp_wayfinder.main import app

client = TestClient(app)


def test_trips_batch_and_get_trip(monkeypatch, client):
    # fake batch responder that echoes back TripInfo for each id
    def fake_batch(ids):
        return models.TripInfoList(
            trips=[
                models.TripInfo(
                    trip_id=i,
                    route_name=f"route-{i}",
                    destination_display_name=f"dest-{i}",
                    destination_stop_id=f"stop-{i}",
                )
                for i in ids
            ]
        )

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trip_info_batch",
        fake_batch,
    )

    # batch
    resp = client.post("/trips/batch", json={"trip_ids": ["t1", "t2"]})
    assert resp.status_code == 200
    data = resp.json()
    assert "trips" in data and len(data["trips"]) == 2
    assert data["trips"][0]["trip_id"] == "t1"

    # get single trip
    resp2 = client.get("/trips/t1")
    assert resp2.status_code == 200
    assert resp2.json()["trip_id"] == "t1"

    # missing trip should 404
    def fake_empty(ids):
        return models.TripInfoList(trips=[])

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trip_info_batch",
        fake_empty,
    )
    resp3 = client.get("/trips/nope")
    assert resp3.status_code == 404


def test_path_search_and_travels(monkeypatch, client):
    # shortest path
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_shortest_path",
        lambda a, b, s=None: ["A", "B", "C"],
    )

    # travels: return a list of dicts (adapter may return objects; dicts should be passed through)
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_travels_from_path",
        lambda path, s=None: [
            {
                "trip_id": "t-1",
                "fare": 120,
                "arrival_time": "09:00:00",
                "departure_time": "09:05:00",
                "from_stop_id": "sA",
                "to_stop_id": "sB",
            }
        ],
    )

    resp = client.get("/path/search?from_stop=X&to_stop=Y")
    assert resp.status_code == 200
    assert resp.json() == {"path": ["A", "B", "C"]}

    resp2 = client.get("/path/travels?from_stop=X&to_stop=Y")
    assert resp2.status_code == 200
    body = resp2.json()
    assert "travels" in body and isinstance(body["travels"], list)
    assert body["travels"][0]["trip_id"] == "t-1"


def test_upcoming_variants(monkeypatch, client):
    stop_id = "S100"

    # no trips
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trips_from_stop",
        lambda stop, s=None: None,
    )
    resp = client.get(f"/stops/{stop_id}/upcoming")
    assert resp.status_code == 200
    assert resp.json() == {"stop_id": stop_id, "buses": []}

    # with trips and times
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

    # expand=trip_info should still return TripIdAndTime fields (current response_model)
    def fake_info(ids):
        return models.TripInfoList(
            trips=[
                models.TripInfo(
                    trip_id=i,
                    route_name="r",
                    destination_display_name="d",
                    destination_stop_id="s",
                )
                for i in ids
            ]
        )

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trip_info_batch",
        fake_info,
    )

    resp3 = client.get(f"/stops/{stop_id}/upcoming?expand=trip_info")
    assert resp3.status_code == 200
    # serialization uses the endpoint response_model; ensure TripId and times are present
    j = resp3.json()
    assert "buses" in j and j["buses"][0]["trip_id"] == "tA"
