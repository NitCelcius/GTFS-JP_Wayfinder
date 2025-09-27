def test_search_stops(monkeypatch, client):
    # fake _wf with get_stop_id that returns an object with to_dict
    class FakeRes:
        def to_dict(self, _):
            return [{"stop_id": "1021_01", "stop_name": "中央公園"}]

    class FakeWF:
        def get_stop_id(self, name, exact):
            return FakeRes()

    monkeypatch.setattr("gtfs_jp_wayfinder.services.wayfinder._wf", FakeWF())

    resp = client.get("/stops/?name=中央公園&exact=true")
    assert resp.status_code == 200
    assert resp.json() == {
        "stop_ids": [{"stop_id": "1021_01", "stop_name": "中央公園"}]
    }


def test_path_timed_search(monkeypatch, client):
    # shortest path
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_shortest_path",
        lambda a, b, s=None: ["S1", "S2"],
    )

    # timed travels from path
    monkeypatch.setattr(
        "gtfs_jp_wayfinder.services.wayfinder_adapter.get_timed_travels_from_path",
        lambda path, s=None, begin_time=None: [
            {
                "trip_id": "t1",
                "departure_time": "08:00:00",
                "arrival_time": "08:30:00",
                "from_stop_id": "S1",
                "to_stop_id": "S2",
                "fare": 150,
            }
        ],
    )

    resp = client.get("/path/timed_search?from_stop=S1&to_stop=S2&begin_time=08:00:00")
    assert resp.status_code == 200
    body = resp.json()
    assert "travels" in body
    assert body["travels"][0]["trip_id"] == "t1"
