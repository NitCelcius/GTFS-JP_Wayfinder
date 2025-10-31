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
    assert resp.json() == {"stop_names": ["中央公園"], "location": None}


def test_get_stop_with_location_field(monkeypatch, client):
    # patch adapter functions
    def fake_get_stop_names(stop_id: str):
        return ["中央公園"]

    def fake_get_stop_lat_lon(stop_id: str):
        return [39.71676, 140.13113]

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stop_names",
        fake_get_stop_names,
    )
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stop_lat_lon",
        fake_get_stop_lat_lon,
    )

    # Request with _fields=location
    resp = client.get("/stops/1021_01?_fields=location")
    assert resp.status_code == 200
    data = resp.json()
    assert data["stop_names"] == ["中央公園"]
    assert data["location"] is not None
    assert data["location"]["lat"] == 39.71676
    assert data["location"]["lon"] == 140.13113


def test_get_stop_without_location_field(monkeypatch, client):
    # patch adapter get_stop_names
    def fake_get_stop_names(stop_id: str):
        return ["中央公園"]

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stop_names",
        fake_get_stop_names,
    )

    # Request without _fields parameter - should not include location
    resp = client.get("/stops/1021_01")
    assert resp.status_code == 200
    data = resp.json()
    assert data["stop_names"] == ["中央公園"]
    assert data.get("location") is None


def test_trips_batch_limit_enforced(monkeypatch, client):
    # ensure env variable default is 10
    import os

    os.environ["API_BATCH_MAX_TRIP_IDS"] = "3"

    # payload with 4 trip ids should be rejected
    resp = client.post("/trips/batch", json={"trip_ids": ["a", "b", "c", "d"]})
    assert resp.status_code == 400
    assert "batch limit" in resp.json().get("detail", "")
