def test_get_stop_names_monkeypatch(monkeypatch, client):
    # patch adapter get_stop_names
    def fake_get_stop_names(stop_id: str):
        return ["中央公園"]

    def fake_get_platform_code(stop_id: str):
        return None

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stop_names",
        fake_get_stop_names,
    )
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_platform_code",
        fake_get_platform_code,
    )

    resp = client.get("/stops/1021_01")
    assert resp.status_code == 200
    assert resp.json() == {
        "stop_names": ["中央公園"],
        "platform_code": None,
        "location": None,
    }


def test_get_stop_with_location_field(monkeypatch, client):
    # patch adapter functions
    def fake_get_stop_names(stop_id: str):
        return ["中央公園"]

    def fake_get_platform_code(stop_id: str):
        return None

    def fake_get_stop_lat_lon(stop_id: str):
        return [39.71676, 140.13113]

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stop_names",
        fake_get_stop_names,
    )
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_platform_code",
        fake_get_platform_code,
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
    assert data["platform_code"] is None
    assert data["location"] is not None
    assert data["location"]["lat"] == 39.71676
    assert data["location"]["lon"] == 140.13113


def test_get_stop_without_location_field(monkeypatch, client):
    # patch adapter get_stop_names
    def fake_get_stop_names(stop_id: str):
        return ["中央公園"]

    def fake_get_platform_code(stop_id: str):
        return None

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stop_names",
        fake_get_stop_names,
    )
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_platform_code",
        fake_get_platform_code,
    )

    # Request without _fields parameter - should not include location
    resp = client.get("/stops/1021_01")
    assert resp.status_code == 200
    data = resp.json()
    assert data["stop_names"] == ["中央公園"]
    assert data["platform_code"] is None
    assert data.get("location") is None


def test_get_stop_with_platform_code(monkeypatch, client):
    # patch adapter functions to return a stop with platform_code
    def fake_get_stop_names(stop_id: str):
        return ["秋田駅西口"]

    def fake_get_platform_code(stop_id: str):
        return "2"

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stop_names",
        fake_get_stop_names,
    )
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_platform_code",
        fake_get_platform_code,
    )

    # Request stop info - should include platform_code
    resp = client.get("/stops/1022_02")
    assert resp.status_code == 200
    data = resp.json()
    assert data["stop_names"] == ["秋田駅西口"]
    assert data["platform_code"] == "2"
    assert data.get("location") is None


def test_get_stop_with_platform_code_and_location(monkeypatch, client):
    # patch adapter functions to return a stop with platform_code and location
    def fake_get_stop_names(stop_id: str):
        return ["秋田駅西口"]

    def fake_get_platform_code(stop_id: str):
        return "3"

    def fake_get_stop_lat_lon(stop_id: str):
        return [39.7171, 140.1284]

    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stop_names",
        fake_get_stop_names,
    )
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_platform_code",
        fake_get_platform_code,
    )
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_stop_lat_lon",
        fake_get_stop_lat_lon,
    )

    # Request stop info with location field
    resp = client.get("/stops/1022_03?_fields=location")
    assert resp.status_code == 200
    data = resp.json()
    assert data["stop_names"] == ["秋田駅西口"]
    assert data["platform_code"] == "3"
    assert data["location"] is not None
    assert data["location"]["lat"] == 39.7171
    assert data["location"]["lon"] == 140.1284


def test_trips_batch_limit_enforced(monkeypatch, client):
    # Use monkeypatch to set env variable - it will auto-restore after test
    monkeypatch.setenv("API_BATCH_MAX_TRIP_IDS", "3")

    # payload with 4 trip ids should be rejected
    resp = client.post("/trips/batch", json={"trip_ids": ["a", "b", "c", "d"]})
    assert resp.status_code == 400
    assert "batch limit" in resp.json().get("detail", "")
