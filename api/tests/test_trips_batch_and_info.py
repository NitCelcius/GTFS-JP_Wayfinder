from fastapi.testclient import TestClient

from src.gtfs_jp_wayfinder import models
from src.gtfs_jp_wayfinder.main import app

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
            ]
        )

    monkeypatch.setattr(
        "src.gtfs_jp_wayfinder.services.wayfinder_adapter.get_trip_info_batch",
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
