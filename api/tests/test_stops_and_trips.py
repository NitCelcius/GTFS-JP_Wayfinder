from fastapi.testclient import TestClient

from gtfs_jp_wayfinder.main import app

client = TestClient(app)


def test_get_stop_names_monkeypatch(monkeypatch, client):
    # patch adapter get_stop_names
    def fake_get_stop_names(stop_id: str):
        return ["中央公園"]

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stop_names",
        fake_get_stop_names,
    )

    resp = client.get("/stops/1021_01")
    assert resp.status_code == 200
    assert resp.json() == {"stop_names": ["中央公園"]}


def test_trips_batch_limit_enforced(monkeypatch, client):
    # ensure env variable default is 10
    import os

    os.environ["API_BATCH_MAX_TRIP_IDS"] = "3"

    # payload with 4 trip ids should be rejected
    resp = client.post("/trips/batch", json={"trip_ids": ["a", "b", "c", "d"]})
    assert resp.status_code == 400
    assert "batch limit" in resp.json().get("detail", "")
