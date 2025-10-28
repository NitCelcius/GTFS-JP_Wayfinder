from fastapi.testclient import TestClient

from gtfs_jp_wayfinder import models
from gtfs_jp_wayfinder.main import app

client = TestClient(app)


def test_trips_batch_and_get_trip(monkeypatch):
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
            ],
        )

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trip_info_batch",
        fake_batch,
    )

    resp = client.post("/trips/batch", json={"trip_ids": ["t1", "t2"]})
    assert resp.status_code == 200
    data = resp.json()
    assert "trips" in data and len(data["trips"]) == 2
    assert data["trips"][0]["trip_id"] == "t1"

    resp2 = client.get("/trips/t1")
    assert resp2.status_code == 200
    assert resp2.json()["trip_id"] == "t1"


def test_get_trip_not_found(monkeypatch):
    """Test that /trips/{trip_id} returns 404 when trip doesn't exist."""
    def fake_batch_nonexistent(ids):
        # Simulate the real behavior: return TripInfo with all fields None except trip_id
        return models.TripInfoList(
            trips=[
                models.TripInfo(
                    trip_id=i,
                    route_name=None,
                    destination_display_name=None,
                    destination_stop_id=None,
                )
                for i in ids
            ],
        )

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_trip_info_batch",
        fake_batch_nonexistent,
    )

    resp = client.get("/trips/nonexistent_trip_id")
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()
